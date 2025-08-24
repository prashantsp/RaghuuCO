/**
 * Document Security Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for document security functionality including encryption and watermarking
 */

import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import documentSecurityController from '@/controllers/documentSecurityController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * @route POST /api/v1/document-security/upload
 * @desc Upload secure document with encryption and watermarking
 * @access Private
 */
router.post('/upload', 
  authenticateToken, 
  authorizePermission(Permission.UPLOAD_DOCUMENTS),
  upload.single('file'),
  documentSecurityController.uploadSecureDocument
);

/**
 * @route GET /api/v1/document-security/:id/download
 * @desc Download secure document with decryption
 * @access Private
 */
router.get('/:id/download', 
  authenticateToken, 
  authorizePermission(Permission.DOWNLOAD_DOCUMENTS),
  documentSecurityController.downloadSecureDocument
);

/**
 * @route PUT /api/v1/document-security/:id/security
 * @desc Update document security settings
 * @access Private
 */
router.put('/:id/security', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_DOCUMENTS),
  documentSecurityController.updateDocumentSecurity
);

/**
 * @route GET /api/v1/document-security/:id/metadata
 * @desc Get document security metadata
 * @access Private
 */
router.get('/:id/metadata', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_DOCUMENTS),
  documentSecurityController.getDocumentSecurityMetadata
);

/**
 * @route GET /api/v1/document-security/:id/audit
 * @desc Get document access audit log
 * @access Private
 */
router.get('/:id/audit', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_AUDIT_LOGS),
  documentSecurityController.getDocumentAuditLog
);

/**
 * @route GET /api/v1/document-security/:id/access
 * @desc Check document access permissions
 * @access Private
 */
router.get('/:id/access', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_DOCUMENTS),
  documentSecurityController.checkDocumentAccess
);

export default router;