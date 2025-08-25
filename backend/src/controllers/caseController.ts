/**
 * Case Management Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Case management controller with CRUD operations, workflow management,
 * and case assignment functionality
 */

import { Request, Response } from 'express';
import { UserRole, hasPermission, Permission } from '@/utils/roleAccess';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';
// import { DatabaseConfig } from '@/config/database';

const db = new DatabaseService();

/**
 * Get all cases with pagination and filtering
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getCases(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, search, status, priority, assignedTo, clientId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CASES)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view cases'
        }
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build search conditions
    const searchConditions = [];
    const searchParams = [];
    
    if (search) {
      searchConditions.push(`(c.case_number ILIKE $${searchParams.length + 1} OR c.title ILIKE $${searchParams.length + 1} OR c.description ILIKE $${searchParams.length + 1})`);
      searchParams.push(`%${search}%`);
    }
    
    if (status) {
      searchConditions.push(`c.status = $${searchParams.length + 1}`);
      searchParams.push(status);
    }
    
    if (priority) {
      searchConditions.push(`c.priority = $${searchParams.length + 1}`);
      searchParams.push(priority);
    }
    
    if (assignedTo) {
      searchConditions.push(`c.assigned_to = $${searchParams.length + 1}`);
      searchParams.push(assignedTo);
    }
    
    if (clientId) {
      searchConditions.push(`c.client_id = $${searchParams.length + 1}`);
      searchParams.push(clientId);
    }

    const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY c.${sortBy} ${(sortOrder as string).toUpperCase()}`;
    
    // Get cases with pagination and related data
    const cases = await db.query(`
      SELECT 
        c.id, c.case_number, c.title, c.description, c.status, c.priority,
        c.client_id, c.assigned_to, c.assigned_by, c.created_at, c.updated_at,
        c.due_date, c.tags, c.category, c.estimated_hours, c.actual_hours, c.billing_rate,
        cl.first_name as client_first_name, cl.last_name as client_last_name, cl.email as client_email,
        u.first_name as assigned_first_name, u.last_name as assigned_last_name,
        (SELECT COUNT(*) FROM documents WHERE case_id = c.id) as document_count,
        (SELECT COUNT(*) FROM time_entries WHERE case_id = c.id) as time_entry_count
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_to = u.id
      ${whereClause}
      ${orderClause}
      LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
    `, [...searchParams, Number(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM cases c
      ${whereClause}
    `, searchParams);

    const total = parseInt(countResult[0].total);

    logger.businessEvent('cases_retrieved', 'case', 'multiple', (req.user as any)?.id || 'system', {
      page: Number(page),
      limit: Number(limit),
      total,
      filters: { search, status, priority, assignedTo, clientId }
    });

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error getting cases', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve cases'
      }
    });
  }
}

/**
 * Get case by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getCaseById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CASES)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view cases'
        }
      });
      return;
    }

    const caseData = await db.getCaseById(id || '');
    
    if (!caseData) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: 'Case not found'
        }
      });
      return;
    }

    // Get case documents
    const documents = await db.query(`
      SELECT 
        id, title, file_name, file_size, file_type, created_at, uploaded_by
      FROM documents 
      WHERE case_id = $1 
      ORDER BY created_at DESC
    `, [id]);

    // Get case time entries
    const timeEntries = await db.query(`
      SELECT 
        id, task_description, hours_worked, billing_rate, is_billable, date_worked, created_at
      FROM time_entries 
      WHERE case_id = $1 
      ORDER BY date_worked DESC
    `, [id]);

    // Get case audit logs
    const auditLogs = await db.query(`
      SELECT 
        action, old_values, new_values, created_at, user_id
      FROM audit_logs 
      WHERE resource_type = 'case' AND resource_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    logger.businessEvent('case_retrieved', 'case', id || '', (req.user as any)?.id || 'system');

    res.json({
      success: true,
      data: { 
        case: caseData,
        documents,
        timeEntries,
        auditLogs
      }
    });
  } catch (error) {
    logger.error('Error getting case by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve case'
      }
    });
  }
}

/**
 * Create new case
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function createCase(req: Request, res: Response): Promise<void> {
  try {
    const { 
      title, description, clientId, assignedTo, priority, dueDate, 
      category 
    } = req.body;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.CREATE_CASES)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to create cases'
        }
      });
      return;
    }

    // Validate client exists
    const client = await db.getClientById(clientId);
    if (!client) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
      return;
    }

    // Validate assigned user exists (if provided)
    if (assignedTo) {
      const assignedUser = await db.getUserById(assignedTo);
      if (!assignedUser) {
        res.status(400).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Assigned user not found'
          }
        });
        return;
      }
    }

    // Generate case number
    const caseNumber = await generateCaseNumber();

    // Create case
    const caseData = await db.createCase({
      caseNumber,
      title,
      caseType: category || 'general',
      description,
      clientId,
      assignedPartner: assignedTo || (req.user as any)?.id,
      startDate: dueDate || new Date().toISOString(),
      priority: priority || 'medium'
    }, (req.user as any)?.id || 'system');

    logger.businessEvent('case_created', 'case', caseData.id, (req.user as any)?.id || 'system', {
      caseNumber,
      clientId,
      assignedTo,
      createdBy: (req.user as any)?.id
    });

    res.status(201).json({
      success: true,
      data: { case: caseData }
    });
  } catch (error) {
    logger.error('Error creating case', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create case'
      }
    });
  }
}

/**
 * Update case
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function updateCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { 
      title, description, assignedTo, status, priority, dueDate, 
      category, estimatedHours, actualHours 
    } = req.body;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.UPDATE_CASES)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update cases'
        }
      });
      return;
    }

    // Get existing case
    const existingCase = await db.getCaseById(id || '');
    if (!existingCase) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: 'Case not found'
        }
      });
      return;
    }

    // Validate assigned user exists (if changing assignment)
    if (assignedTo && assignedTo !== existingCase.assigned_to) {
      const assignedUser = await db.getUserById(assignedTo);
      if (!assignedUser) {
        res.status(400).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Assigned user not found'
          }
        });
        return;
      }
    }

    // Update case
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = dueDate;
    if (category) updateData.category = category;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;

    const caseData = await db.updateCase(id || '', updateData);

    logger.businessEvent('case_updated', 'case', id || '', (req.user as any)?.id || 'system', {
      updatedFields: Object.keys(updateData),
      updatedBy: (req.user as any)?.id
    });

    res.json({
      success: true,
      data: { case: caseData }
    });
  } catch (error) {
    logger.error('Error updating case', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update case'
      }
    });
  }
}

/**
 * Delete case (soft delete)
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function deleteCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.DELETE_CASES)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete cases'
        }
      });
      return;
    }

    // Get existing case
    const existingCase = await db.getCaseById(id || '');
    if (!existingCase) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: 'Case not found'
        }
      });
      return;
    }

    // Check if case is active
    if (existingCase.status === 'open' || existingCase.status === 'in_progress') {
      res.status(400).json({
        success: false,
        error: {
          code: 'CASE_IS_ACTIVE',
          message: 'Cannot delete active case'
        }
      });
      return;
    }

    // Soft delete case
    await db.query('UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2', ['deleted', id || '']);

    logger.businessEvent('case_deleted', 'case', id || '', (req.user as any)?.id || 'system', {
      deletedCase: existingCase.case_number,
      deletedBy: (req.user as any)?.id
    });

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting case', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete case'
      }
    });
  }
}

/**
 * Get case statistics
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getCaseStats(req: Request, res: Response): Promise<void> {
  try {
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CASES)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view case statistics'
        }
      });
      return;
    }

    // Get total cases
    const totalCases = await db.query('SELECT COUNT(*) as count FROM cases WHERE status != $1', ['deleted']);
    
    // Get cases by status
    const casesByStatus = await db.query(`
      SELECT status, COUNT(*) as count
      FROM cases 
      WHERE status != 'deleted'
      GROUP BY status
      ORDER BY count DESC
    `);

    // Get cases by priority
    const casesByPriority = await db.query(`
      SELECT priority, COUNT(*) as count
      FROM cases 
      WHERE status != 'deleted'
      GROUP BY priority
      ORDER BY count DESC
    `);

    // Get cases by assigned user
    const casesByUser = await db.query(`
      SELECT 
        u.first_name, u.last_name, u.email,
        COUNT(c.id) as case_count
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_to AND c.status != 'deleted'
      WHERE u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY case_count DESC
      LIMIT 10
    `);

    // Get recent cases
    const recentCases = await db.query(`
      SELECT 
        c.id, c.case_number, c.title, c.status, c.priority, c.created_at,
        cl.first_name as client_first_name, cl.last_name as client_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.status != 'deleted'
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    logger.businessEvent('case_stats_retrieved', 'case', 'statistics', (req.user as any)?.id || 'system');

    res.json({
      success: true,
      data: {
        totalCases: parseInt(totalCases[0].count),
        casesByStatus,
        casesByPriority,
        casesByUser,
        recentCases
      }
    });
  } catch (error) {
    logger.error('Error getting case statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve case statistics'
      }
    });
  }
}

/**
 * Generate unique case number
 * 
 * @returns Promise<string>
 */
async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await db.query(`
    SELECT COUNT(*) as count 
    FROM cases 
    WHERE case_number LIKE $1
  `, [`CASE-${year}-%`]);
  
  const count = parseInt(result[0].count) + 1;
  return `CASE-${year}-${count.toString().padStart(4, '0')}`;
}

export default {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCaseStats
};