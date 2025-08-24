/**
 * Case Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Case management API routes with authentication, authorization,
 * and input validation
 */

import { Router } from 'express';
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCaseStats
} from '@/controllers/caseController';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/cases
 * Get all cases with pagination and filtering
 * Required permissions: case:read
 */
router.get('/', 
  authenticateToken,
  authorizePermission('case:read'),
  async (req, res, next) => {
    try {
      await getCases(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/cases/stats
 * Get case statistics
 * Required permissions: case:read
 */
router.get('/stats',
  authenticateToken,
  authorizePermission('case:read'),
  async (req, res, next) => {
    try {
      await getCaseStats(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/cases/:id
 * Get case by ID
 * Required permissions: case:read
 */
router.get('/:id',
  authenticateToken,
  authorizePermission('case:read'),
  async (req, res, next) => {
    try {
      await getCaseById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/cases
 * Create new case
 * Required permissions: case:create
 */
router.post('/',
  authenticateToken,
  authorizePermission('case:create'),
  async (req, res, next) => {
    try {
      await createCase(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/cases/:id
 * Update case
 * Required permissions: case:update
 */
router.put('/:id',
  authenticateToken,
  authorizePermission('case:update'),
  async (req, res, next) => {
    try {
      await updateCase(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/cases/:id
 * Delete case (soft delete)
 * Required permissions: case:delete
 */
router.delete('/:id',
  authenticateToken,
  authorizePermission('case:delete'),
  async (req, res, next) => {
    try {
      await deleteCase(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;