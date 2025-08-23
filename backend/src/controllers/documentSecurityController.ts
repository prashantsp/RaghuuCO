/**
 * Document Security Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Controller for document security management including encryption and watermarking
 */

import { Request, Response } from 'express';
import { documentSecurityService } from '@/services/documentSecurityService';
import logger from '@/utils/logger';

/**
 * Upload secure document
 * 
 * @route POST /api/v1/document-security/upload
 * @access Private
 */
export const uploadSecureDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      title,
      description,
      caseId,
      clientId,
      securityLevel,
      watermarkText,
      watermarkPosition
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE_PROVIDED',
          message: 'No file provided'
        }
      });
    }

    logger.info('Uploading secure document', { userId, title, securityLevel });

    // Generate document ID
    const documentId = crypto.randomUUID();
    const fileName = `${documentId}${path.extname(file.originalname)}`;

    // Save document with security
    await documentSecurityService.saveSecureDocument(
      fileName,
      file.buffer,
      securityLevel || 'internal',
      watermarkText,
      watermarkPosition || 'bottom_right'
    );

    // Save document metadata to database
    const result = await db.query(`
      INSERT INTO documents (id, title, description, file_name, file_size, file_type, 
                           case_id, client_id, uploaded_by, security_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      documentId,
      title,
      description,
      fileName,
      file.size,
      file.mimetype,
      caseId || null,
      clientId || null,
      userId,
      securityLevel || 'internal'
    ]);

    const document = result.rows[0];

    logger.businessEvent('secure_document_uploaded', 'document', document.id, userId);

    res.status(201).json({
      success: true,
      data: { document }
    });
  } catch (error) {
    logger.error('Error uploading secure document', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SECURE_DOCUMENT_UPLOAD_ERROR',
        message: 'Failed to upload secure document'
      }
    });
  }
};

/**
 * Download secure document
 * 
 * @route GET /api/v1/document-security/:id/download
 * @access Private
 */
export const downloadSecureDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Downloading secure document', { userId, documentId: id });

    // Get document metadata
    const documentResult = await db.query(`
      SELECT * FROM documents WHERE id = $1
    `, [id]);

    const document = documentResult.rows[0];
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    // Get secure document content
    const documentContent = await documentSecurityService.getSecureDocument(id, userId);

    // Set response headers
    res.setHeader('Content-Type', document.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.title}"`);
    res.setHeader('Content-Length', documentContent.length);

    // Send document
    res.send(documentContent);

    logger.businessEvent('secure_document_downloaded', 'document', id, userId);
  } catch (error) {
    logger.error('Error downloading secure document', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SECURE_DOCUMENT_DOWNLOAD_ERROR',
        message: 'Failed to download secure document'
      }
    });
  }
};

/**
 * Update document security settings
 * 
 * @route PUT /api/v1/document-security/:id/security
 * @access Private
 */
export const updateDocumentSecurity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      securityLevel,
      watermarkText,
      watermarkPosition
    } = req.body;

    logger.info('Updating document security settings', { userId, documentId: id });

    // Check if document exists
    const documentResult = await db.query(`
      SELECT * FROM documents WHERE id = $1
    `, [id]);

    const document = documentResult.rows[0];
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    // Update security settings
    await documentSecurityService.updateDocumentSecurity(
      id,
      securityLevel,
      watermarkText,
      watermarkPosition
    );

    // Update document metadata
    await db.query(`
      UPDATE documents SET security_level = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id, securityLevel]);

    logger.businessEvent('document_security_updated', 'document', id, userId);

    res.json({
      success: true,
      message: 'Document security settings updated successfully'
    });
  } catch (error) {
    logger.error('Error updating document security', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCUMENT_SECURITY_UPDATE_ERROR',
        message: 'Failed to update document security settings'
      }
    });
  }
};

/**
 * Get document security metadata
 * 
 * @route GET /api/v1/document-security/:id/metadata
 * @access Private
 */
export const getDocumentSecurityMetadata = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Getting document security metadata', { userId, documentId: id });

    // Get document metadata
    const documentResult = await db.query(`
      SELECT * FROM documents WHERE id = $1
    `, [id]);

    const document = documentResult.rows[0];
    if (!document) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    // Get security metadata
    const securityMetadata = await documentSecurityService.getDocumentSecurityMetadata(id);

    res.json({
      success: true,
      data: {
        document,
        security: securityMetadata
      }
    });
  } catch (error) {
    logger.error('Error getting document security metadata', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCUMENT_SECURITY_METADATA_ERROR',
        message: 'Failed to get document security metadata'
      }
    });
  }
};

/**
 * Get document access audit log
 * 
 * @route GET /api/v1/document-security/:id/audit
 * @access Private
 */
export const getDocumentAuditLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Getting document audit log', { userId, documentId: id });

    // Get audit logs for document
    const result = await db.query(`
      SELECT al.*, u.first_name, u.last_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = 'document' AND al.entity_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, parseInt(limit as string), offset]);

    const auditLogs = result.rows;

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM audit_logs
      WHERE entity_type = 'document' AND entity_id = $1
    `, [id]);

    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error('Error getting document audit log', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCUMENT_AUDIT_LOG_ERROR',
        message: 'Failed to get document audit log'
      }
    });
  }
};

/**
 * Check document access permissions
 * 
 * @route GET /api/v1/document-security/:id/access
 * @access Private
 */
export const checkDocumentAccess = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Checking document access', { userId, documentId: id });

    const hasAccess = await documentSecurityService.checkDocumentAccess(id, userId);

    res.json({
      success: true,
      data: {
        hasAccess,
        documentId: id
      }
    });
  } catch (error) {
    logger.error('Error checking document access', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DOCUMENT_ACCESS_CHECK_ERROR',
        message: 'Failed to check document access'
      }
    });
  }
};

export default {
  uploadSecureDocument,
  downloadSecureDocument,
  updateDocumentSecurity,
  getDocumentSecurityMetadata,
  getDocumentAuditLog,
  checkDocumentAccess
};