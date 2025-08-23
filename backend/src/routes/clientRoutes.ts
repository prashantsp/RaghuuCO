/**
 * Client Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Client management API routes with authentication, authorization,
 * and input validation
 */

import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  checkClientConflicts,
  getClientStats
} from '@/controllers/clientController';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/clients
 * Get all clients with pagination and filtering
 * Required permissions: client:read
 */
router.get('/', 
  authenticateToken,
  authorizePermission('client:read'),
  async (req, res, next) => {
    try {
      await getClients(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/clients/stats
 * Get client statistics
 * Required permissions: client:read
 */
router.get('/stats',
  authenticateToken,
  authorizePermission('client:read'),
  async (req, res, next) => {
    try {
      await getClientStats(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/clients/conflicts
 * Check for client conflicts
 * Required permissions: client:read
 */
router.get('/conflicts',
  authenticateToken,
  authorizePermission('client:read'),
  async (req, res, next) => {
    try {
      await checkClientConflicts(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/clients/:id
 * Get client by ID
 * Required permissions: client:read
 */
router.get('/:id',
  authenticateToken,
  authorizePermission('client:read'),
  async (req, res, next) => {
    try {
      await getClientById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/clients
 * Create new client
 * Required permissions: client:create
 */
router.post('/',
  authenticateToken,
  authorizePermission('client:create'),
  async (req, res, next) => {
    try {
      await createClient(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/clients/:id
 * Update client
 * Required permissions: client:update
 */
router.put('/:id',
  authenticateToken,
  authorizePermission('client:update'),
  async (req, res, next) => {
    try {
      await updateClient(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/clients/:id
 * Delete client (soft delete)
 * Required permissions: client:delete
 */
router.delete('/:id',
  authenticateToken,
  authorizePermission('client:delete'),
  async (req, res, next) => {
    try {
      await deleteClient(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;