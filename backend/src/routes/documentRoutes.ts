/**
 * Document Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Document management API routes with authentication, authorization,
 * and input validation
 */

import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  searchDocuments,
  getDocumentStats
} from '@/controllers/documentController';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/documents
 * Get all documents with pagination and filtering
 * Required permissions: document:read
 */
router.get('/', 
  authenticateToken,
  getDocuments
);

/**
 * GET /api/v1/documents/stats
 * Get document statistics
 * Required permissions: document:read
 */
router.get('/stats',
  authenticateToken,
  getDocumentStats
);

/**
 * GET /api/v1/documents/search
 * Search documents with full-text search
 * Required permissions: document:read
 */
router.get('/search',
  authenticateToken,
  searchDocuments
);

/**
 * GET /api/v1/documents/:id
 * Get document by ID
 * Required permissions: document:read
 */
router.get('/:id',
  authenticateToken,
  getDocumentById
);

/**
 * GET /api/v1/documents/:id/download
 * Download document
 * Required permissions: document:read
 */
router.get('/:id/download',
  authenticateToken,
  downloadDocument
);

/**
 * POST /api/v1/documents
 * Upload new document
 * Required permissions: document:create
 */
router.post('/',
  authenticateToken,
  uploadDocument
);

/**
 * PUT /api/v1/documents/:id
 * Update document metadata
 * Required permissions: document:update
 */
router.put('/:id',
  authenticateToken,
  updateDocument
);

/**
 * DELETE /api/v1/documents/:id
 * Delete document (soft delete)
 * Required permissions: document:delete
 */
router.delete('/:id',
  authenticateToken,
  deleteDocument
);

export default router;