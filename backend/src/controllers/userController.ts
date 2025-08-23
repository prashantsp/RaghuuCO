/**
 * User Management Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description User management controller with CRUD operations, role-based access,
 * and user activity tracking
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import { UserRole, hasPermission, canManageUser } from '@/utils/roleAccess';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';
import { hashPassword } from '@/middleware/auth';

const db = new DatabaseService(databaseConfig);

/**
 * Get all users with pagination and filtering
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, search, role, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'user:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view users'
        }
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build search conditions
    const searchConditions = [];
    const searchParams = [];
    
    if (search) {
      searchConditions.push(`(first_name ILIKE $${searchParams.length + 1} OR last_name ILIKE $${searchParams.length + 1} OR email ILIKE $${searchParams.length + 1})`);
      searchParams.push(`%${search}%`);
    }
    
    if (role) {
      searchConditions.push(`role = $${searchParams.length + 1}`);
      searchParams.push(role);
    }
    
    if (isActive !== undefined) {
      searchConditions.push(`is_active = $${searchParams.length + 1}`);
      searchParams.push(isActive === 'true');
    }

    const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    
    // Get users with pagination
    const users = await db.query(`
      SELECT 
        id, email, first_name, last_name, role, phone, is_active, 
        email_verified, last_login, created_at, updated_at
      FROM users 
      ${whereClause}
      ${orderClause}
      LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
    `, [...searchParams, Number(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM users 
      ${whereClause}
    `, searchParams);

    const total = parseInt(countResult[0].total);

    logger.businessEvent('users_retrieved', 'user', 'multiple', req.user?.id || 'system', {
      page: Number(page),
      limit: Number(limit),
      total,
      filters: { search, role, isActive }
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error getting users', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve users'
      }
    });
  }
}

/**
 * Get user by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Check permissions - users can view their own profile or if they have user:read permission
    if (req.user?.id !== id && !hasPermission(req.user?.role as UserRole, 'user:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this user'
        }
      });
      return;
    }

    const user = await db.getUserById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    // Remove sensitive information
    delete user.password_hash;

    logger.businessEvent('user_retrieved', 'user', id, req.user?.id || 'system');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error getting user by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user'
      }
    });
  }
}

/**
 * Create new user
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'user:create')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to create users'
        }
      });
      return;
    }

    // Check if user can manage the specified role
    if (!canManageUser(req.user?.role as UserRole, role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to assign this role'
        }
      });
      return;
    }

    // Check if email already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'User with this email already exists'
        }
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      phone
    });

    // Remove sensitive information
    delete user.password_hash;

    logger.businessEvent('user_created', 'user', user.id, req.user?.id || 'system', {
      email,
      role,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error creating user', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user'
      }
    });
  }
}

/**
 * Update user
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;
    
    // Check permissions - users can update their own profile or if they have user:update permission
    if (req.user?.id !== id && !hasPermission(req.user?.role as UserRole, 'user:update')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this user'
        }
      });
      return;
    }

    // Get existing user
    const existingUser = await db.getUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    // Check role management permissions
    if (role && !canManageUser(req.user?.role as UserRole, role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to assign this role'
        }
      });
      return;
    }

    // Update user
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await db.updateUser(id, updateData);

    // Remove sensitive information
    delete user.password_hash;

    logger.businessEvent('user_updated', 'user', id, req.user?.id || 'system', {
      updatedFields: Object.keys(updateData),
      updatedBy: req.user?.id
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error updating user', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user'
      }
    });
  }
}

/**
 * Delete user (soft delete)
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'user:delete')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete users'
        }
      });
      return;
    }

    // Prevent self-deletion
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SELF_DELETE_NOT_ALLOWED',
          message: 'You cannot delete your own account'
        }
      });
      return;
    }

    // Get existing user
    const existingUser = await db.getUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    // Check if user can manage the target user's role
    if (!canManageUser(req.user?.role as UserRole, existingUser.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this user'
        }
      });
      return;
    }

    // Soft delete user
    await db.query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);

    logger.businessEvent('user_deleted', 'user', id, req.user?.id || 'system', {
      deletedUser: existingUser.email,
      deletedBy: req.user?.id
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete user'
      }
    });
  }
}

/**
 * Get user activity and analytics
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getUserActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    
    // Check permissions
    if (req.user?.id !== id && !hasPermission(req.user?.role as UserRole, 'user:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this user activity'
        }
      });
      return;
    }

    // Get user audit logs
    const auditLogs = await db.query(`
      SELECT 
        action, resource_type, resource_id, created_at, ip_address, user_agent
      FROM audit_logs 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
      LIMIT 100
    `, [id]);

    // Get login history
    const loginHistory = await db.query(`
      SELECT 
        created_at, ip_address, user_agent
      FROM user_sessions 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    // Get activity summary
    const activitySummary = await db.query(`
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY action
      ORDER BY count DESC
    `, [id]);

    logger.businessEvent('user_activity_retrieved', 'user', id, req.user?.id || 'system');

    res.json({
      success: true,
      data: {
        auditLogs,
        loginHistory,
        activitySummary,
        period: `${days} days`
      }
    });
  } catch (error) {
    logger.error('Error getting user activity', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user activity'
      }
    });
  }
}

/**
 * Get assignable roles for the current user
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getAssignableRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { getAssignableRoles } = await import('@/utils/roleAccess');
    const assignableRoles = getAssignableRoles(req.user?.role as UserRole);

    res.json({
      success: true,
      data: { roles: assignableRoles }
    });
  } catch (error) {
    logger.error('Error getting assignable roles', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve assignable roles'
      }
    });
  }
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserActivity,
  getAssignableRoles
};