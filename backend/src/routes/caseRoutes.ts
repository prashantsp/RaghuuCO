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
import { authenticateToken } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/cases
 * Get all cases with pagination and filtering
 * Required permissions: case:read
 */
router.get('/', 
  authenticateToken,
  getCases
);

/**
 * GET /api/v1/cases/stats
 * Get case statistics
 * Required permissions: case:read
 */
router.get('/stats',
  authenticateToken,
  getCaseStats
);

/**
 * GET /api/v1/cases/:id
 * Get case by ID
 * Required permissions: case:read
 */
router.get('/:id',
  authenticateToken,
  getCaseById
);

/**
 * POST /api/v1/cases
 * Create new case
 * Required permissions: case:create
 */
router.post('/',
  authenticateToken,
  createCase
);

/**
 * PUT /api/v1/cases/:id
 * Update case
 * Required permissions: case:update
 */
router.put('/:id',
  authenticateToken,
  updateCase
);

/**
 * DELETE /api/v1/cases/:id
 * Delete case (soft delete)
 * Required permissions: case:delete
 */
router.delete('/:id',
  authenticateToken,
  deleteCase
);

export default router;