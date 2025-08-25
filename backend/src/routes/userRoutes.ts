/**
 * User Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description User management API routes with authentication, authorization,
 * and input validation
 */

import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserActivity,
  getAssignableRoles
} from '@/controllers/userController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * GET /api/v1/users
 * Get all users with pagination and filtering
 * Required permissions: user:read
 */
router.get('/', 
  authenticateToken,
  getUsers
);

/**
 * GET /api/v1/users/assignable-roles
 * Get assignable roles for the current user
 * Required permissions: user:create or user:update
 */
router.get('/assignable-roles',
  authenticateToken,
  getAssignableRoles
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 * Required permissions: user:read or own profile
 */
router.get('/:id',
  authenticateToken,
  getUserById
);

/**
 * GET /api/v1/users/:id/activity
 * Get user activity and analytics
 * Required permissions: user:read or own profile
 */
router.get('/:id/activity',
  authenticateToken,
  getUserActivity
);

/**
 * POST /api/v1/users
 * Create new user
 * Required permissions: user:create
 */
router.post('/',
  authenticateToken,
  createUser
);

/**
 * PUT /api/v1/users/:id
 * Update user
 * Required permissions: user:update or own profile
 */
router.put('/:id',
  authenticateToken,
  updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Delete user (soft delete)
 * Required permissions: user:delete
 */
router.delete('/:id',
  authenticateToken,
  deleteUser
);

export default router;