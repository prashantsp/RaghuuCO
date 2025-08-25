/**
 * Client Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
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
import { authenticateToken } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/clients
 * Get all clients with pagination and filtering
 * Required permissions: client:read
 */
router.get('/', 
  authenticateToken,
  getClients
);

/**
 * GET /api/v1/clients/stats
 * Get client statistics
 * Required permissions: client:read
 */
router.get('/stats',
  authenticateToken,
  getClientStats
);

/**
 * GET /api/v1/clients/conflicts
 * Check for client conflicts
 * Required permissions: client:read
 */
router.get('/conflicts',
  authenticateToken,
  checkClientConflicts
);

/**
 * GET /api/v1/clients/:id
 * Get client by ID
 * Required permissions: client:read
 */
router.get('/:id',
  authenticateToken,
  getClientById
);

/**
 * POST /api/v1/clients
 * Create new client
 * Required permissions: client:create
 */
router.post('/',
  authenticateToken,
  createClient
);

/**
 * PUT /api/v1/clients/:id
 * Update client
 * Required permissions: client:update
 */
router.put('/:id',
  authenticateToken,
  updateClient
);

/**
 * DELETE /api/v1/clients/:id
 * Delete client (soft delete)
 * Required permissions: client:delete
 */
router.delete('/:id',
  authenticateToken,
  deleteClient
);

export default router;