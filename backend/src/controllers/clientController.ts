/**
 * Client Management Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Client management controller with CRUD operations, conflict checking,
 * and relationship tracking
 */

import { Request, Response } from 'express';
import { UserRole, hasPermission, Permission } from '@/utils/roleAccess';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Get all clients with pagination and filtering
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getClients(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view clients'
        }
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build search conditions
    const searchConditions = [];
    const searchParams = [];
    
    if (search) {
      searchConditions.push(`(first_name ILIKE $${searchParams.length + 1} OR last_name ILIKE $${searchParams.length + 1} OR email ILIKE $${searchParams.length + 1} OR company ILIKE $${searchParams.length + 1})`);
      searchParams.push(`%${search}%`);
    }
    
    if (isActive !== undefined) {
      searchConditions.push(`is_active = $${searchParams.length + 1}`);
      searchParams.push(isActive === 'true');
    }

    const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY ${sortBy} ${(sortOrder as string).toUpperCase()}`;
    
    // Get clients with pagination
    const clients = await db.query(`
      SELECT 
        id, first_name, last_name, email, phone, company, address,
        is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM cases WHERE client_id = clients.id) as case_count
      FROM clients 
      ${whereClause}
      ${orderClause}
      LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
    `, [...searchParams, Number(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM clients 
      ${whereClause}
    `, searchParams);

    const total = parseInt(countResult[0].total);

    logger.businessEvent('clients_retrieved', 'client', 'multiple', (req.user as any)?.id || 'system', {
      page: Number(page),
      limit: Number(limit),
      total,
      filters: { search, isActive }
    });

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error getting clients', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve clients'
      }
    });
  }
}

/**
 * Get client by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getClientById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view clients'
        }
      });
      return;
    }

    const client = await db.getClientById(id || '');
    
    if (!client) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
      return;
    }

    // Get client's cases
    const cases = await db.query(`
      SELECT 
        id, case_number, title, status, priority, created_at, updated_at
      FROM cases 
      WHERE client_id = $1 
      ORDER BY created_at DESC
    `, [id]);

    // Get client's documents
    const documents = await db.query(`
      SELECT 
        id, title, file_name, file_size, file_type, created_at
      FROM documents 
      WHERE client_id = $1 
      ORDER BY created_at DESC
      LIMIT 10
    `, [id]);

    logger.businessEvent('client_retrieved', 'client', id || '', (req.user as any)?.id || 'system');

    res.json({
      success: true,
      data: { 
        client,
        cases,
        documents
      }
    });
  } catch (error) {
    logger.error('Error getting client by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve client'
      }
    });
  }
}

/**
 * Create new client
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function createClient(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, phone, company, address } = req.body;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.CREATE_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to create clients'
        }
      });
      return;
    }

    // Check if email already exists
    const existingClient = await db.query('SELECT id FROM clients WHERE email = $1', [email]);
    if (existingClient.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Client with this email already exists'
        }
      });
      return;
    }

    // Create client
    const client = await db.createClient({
      clientType: 'individual',
      firstName,
      lastName,
      email,
      phone,
      companyName: company,
      address
    }, (req.user as any)?.id || 'system');

    logger.businessEvent('client_created', 'client', client.id, (req.user as any)?.id || 'system', {
      email,
      company,
      createdBy: (req.user as any)?.id
    });

    res.status(201).json({
      success: true,
      data: { client }
    });
  } catch (error) {
    logger.error('Error creating client', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create client'
      }
    });
  }
}

/**
 * Update client
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function updateClient(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, company, address, isActive } = req.body;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.UPDATE_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update clients'
        }
      });
      return;
    }

    // Get existing client
    const existingClient = await db.getClientById(id || '');
    if (!existingClient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
      return;
    }

    // Check if email already exists (if changing email)
    if (email && email !== existingClient.email) {
      const emailCheck = await db.query('SELECT id FROM clients WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.length > 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Client with this email already exists'
          }
        });
        return;
      }
    }

    // Update client
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (address) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await db.query(`
      UPDATE clients 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        company = COALESCE($5, company),
        address = COALESCE($6, address),
        is_active = COALESCE($7, is_active),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      updateData.firstName,
      updateData.lastName,
      updateData.email,
      updateData.phone,
      updateData.company,
      updateData.address,
      updateData.isActive,
      id
    ]);
    const client = result[0];

    logger.businessEvent('client_updated', 'client', id || '', (req.user as any)?.id || 'system', {
      updatedFields: Object.keys(updateData),
      updatedBy: (req.user as any)?.id
    });

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    logger.error('Error updating client', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update client'
      }
    });
  }
}

/**
 * Delete client (soft delete)
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function deleteClient(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.DELETE_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete clients'
        }
      });
      return;
    }

    // Get existing client
    const existingClient = await db.getClientById(id || '');
    if (!existingClient) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
      return;
    }

    // Check if client has active cases
    const activeCases = await db.query('SELECT COUNT(*) as count FROM cases WHERE client_id = $1 AND status IN ($2, $3)', [id, 'open', 'in_progress']);
    if (parseInt(activeCases[0].count) > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CLIENT_HAS_ACTIVE_CASES',
          message: 'Cannot delete client with active cases'
        }
      });
      return;
    }

    // Soft delete client
    await db.query('UPDATE clients SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);

    logger.businessEvent('client_deleted', 'client', id || '', (req.user as any)?.id || 'system', {
      deletedClient: existingClient.email,
      deletedBy: (req.user as any)?.id
    });

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting client', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete client'
      }
    });
  }
}

/**
 * Check for client conflicts
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function checkClientConflicts(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, phone } = req.query;
    
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to check client conflicts'
        }
      });
      return;
    }

    const conflicts = [];

    // Check email conflicts
    if (email) {
      const emailConflicts = await db.query('SELECT id, first_name, last_name, email FROM clients WHERE email = $1 AND is_active = true', [email]);
      if (emailConflicts.length > 0) {
        conflicts.push({
          type: 'email',
          field: 'email',
          value: email,
          conflicts: emailConflicts
        });
      }
    }

    // Check phone conflicts
    if (phone) {
      const phoneConflicts = await db.query('SELECT id, first_name, last_name, phone FROM clients WHERE phone = $1 AND is_active = true', [phone]);
      if (phoneConflicts.length > 0) {
        conflicts.push({
          type: 'phone',
          field: 'phone',
          value: phone,
          conflicts: phoneConflicts
        });
      }
    }

    // Check name conflicts
    if (firstName && lastName) {
      const nameConflicts = await db.query(
        'SELECT id, first_name, last_name, email FROM clients WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) AND is_active = true',
        [firstName, lastName]
      );
      if (nameConflicts.length > 0) {
        conflicts.push({
          type: 'name',
          field: 'name',
          value: `${firstName} ${lastName}`,
          conflicts: nameConflicts
        });
      }
    }

    logger.businessEvent('client_conflicts_checked', 'client', 'conflict_check', (req.user as any)?.id || 'system', {
      checks: { firstName, lastName, email, phone },
      conflictsFound: conflicts.length
    });

    res.json({
      success: true,
      data: {
        conflicts,
        hasConflicts: conflicts.length > 0
      }
    });
  } catch (error) {
    logger.error('Error checking client conflicts', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check client conflicts'
      }
    });
  }
}

/**
 * Get client statistics
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getClientStats(req: Request, res: Response): Promise<void> {
  try {
    // Check permissions
    if (!hasPermission((req.user as any)?.role as UserRole, Permission.VIEW_CLIENTS)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view client statistics'
        }
      });
      return;
    }

    // Get total clients
    const totalClients = await db.query('SELECT COUNT(*) as count FROM clients WHERE is_active = true');
    
    // Get new clients this month
    const newClientsThisMonth = await db.query(`
      SELECT COUNT(*) as count 
      FROM clients 
      WHERE is_active = true 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Get clients by status
    const clientsByStatus = await db.query(`
      SELECT 
        CASE 
          WHEN c.case_count = 0 THEN 'No Cases'
          WHEN c.case_count = 1 THEN 'Single Case'
          ELSE 'Multiple Cases'
        END as status,
        COUNT(*) as count
      FROM (
        SELECT 
          cl.id,
          COALESCE(COUNT(ca.id), 0) as case_count
        FROM clients cl
        LEFT JOIN cases ca ON cl.id = ca.client_id AND ca.status IN ('open', 'in_progress')
        WHERE cl.is_active = true
        GROUP BY cl.id
      ) c
      GROUP BY 
        CASE 
          WHEN c.case_count = 0 THEN 'No Cases'
          WHEN c.case_count = 1 THEN 'Single Case'
          ELSE 'Multiple Cases'
        END
    `);

    // Get top clients by case count
    const topClients = await db.query(`
      SELECT 
        cl.id,
        cl.first_name,
        cl.last_name,
        cl.email,
        cl.company,
        COUNT(ca.id) as case_count
      FROM clients cl
      LEFT JOIN cases ca ON cl.id = ca.client_id
      WHERE cl.is_active = true
      GROUP BY cl.id, cl.first_name, cl.last_name, cl.email, cl.company
      ORDER BY case_count DESC
      LIMIT 10
    `);

    logger.businessEvent('client_stats_retrieved', 'client', 'statistics', req.user?.id || 'system');

    res.json({
      success: true,
      data: {
        totalClients: parseInt(totalClients[0].count),
        newClientsThisMonth: parseInt(newClientsThisMonth[0].count),
        clientsByStatus,
        topClients
      }
    });
  } catch (error) {
    logger.error('Error getting client statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve client statistics'
      }
    });
  }
}

export default {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  checkClientConflicts,
  getClientStats
};