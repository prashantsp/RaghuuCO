/**
 * User Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
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
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/users
 * Get all users with pagination and filtering
 * Required permissions: user:read
 */
router.get('/', 
  authenticateToken,
  authorizePermission('user:read'),
  async (req, res, next) => {
    try {
      await getUsers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/users/assignable-roles
 * Get assignable roles for the current user
 * Required permissions: user:create or user:update
 */
router.get('/assignable-roles',
  authenticateToken,
  async (req, res, next) => {
    try {
      await getAssignableRoles(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 * Required permissions: user:read or own profile
 */
router.get('/:id',
  authenticateToken,
  async (req, res, next) => {
    try {
      await getUserById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/users/:id/activity
 * Get user activity and analytics
 * Required permissions: user:read or own profile
 */
router.get('/:id/activity',
  authenticateToken,
  async (req, res, next) => {
    try {
      await getUserActivity(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/users
 * Create new user
 * Required permissions: user:create
 */
router.post('/',
  authenticateToken,
  authorizePermission('user:create'),
  async (req, res, next) => {
    try {
      await createUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/users/:id
 * Update user
 * Required permissions: user:update or own profile
 */
router.put('/:id',
  authenticateToken,
  async (req, res, next) => {
    try {
      await updateUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/users/:id
 * Delete user (soft delete)
 * Required permissions: user:delete
 */
router.delete('/:id',
  authenticateToken,
  authorizePermission('user:delete'),
  async (req, res, next) => {
    try {
      await deleteUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;