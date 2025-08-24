/**
 * Document Management Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Document management controller with file upload, versioning,
 * categorization, and full-text search functionality
 */

import { Request, Response } from 'express';
import { UserRole, hasPermission } from '@/utils/roleAccess';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const db = new DatabaseService(databaseConfig);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * Get all documents with pagination and filtering
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getDocuments(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, search, category, fileType, caseId, clientId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view documents'
        }
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build search conditions
    const searchConditions = [];
    const searchParams = [];
    
    if (search) {
      searchConditions.push(`(d.title ILIKE $${searchParams.length + 1} OR d.description ILIKE $${searchParams.length + 1} OR d.file_name ILIKE $${searchParams.length + 1})`);
      searchParams.push(`%${search}%`);
    }
    
    if (category) {
      searchConditions.push(`d.category = $${searchParams.length + 1}`);
      searchParams.push(category);
    }
    
    if (fileType) {
      searchConditions.push(`d.file_type = $${searchParams.length + 1}`);
      searchParams.push(fileType);
    }
    
    if (caseId) {
      searchConditions.push(`d.case_id = $${searchParams.length + 1}`);
      searchParams.push(caseId);
    }
    
    if (clientId) {
      searchConditions.push(`d.client_id = $${searchParams.length + 1}`);
      searchParams.push(clientId);
    }

    const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
    const orderClause = `ORDER BY d.${sortBy} ${sortOrder.toUpperCase()}`;
    
    // Get documents with pagination and related data
    const documents = await db.query(`
      SELECT 
        d.id, d.title, d.description, d.file_name, d.file_path, d.file_size, d.file_type,
        d.category, d.tags, d.version, d.is_public, d.created_at, d.updated_at,
        d.case_id, d.client_id, d.uploaded_by,
        c.case_number, c.title as case_title,
        cl.first_name as client_first_name, cl.last_name as client_last_name,
        u.first_name as uploaded_first_name, u.last_name as uploaded_last_name
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      ${whereClause}
      ${orderClause}
      LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
    `, [...searchParams, Number(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM documents d
      ${whereClause}
    `, searchParams);

    const total = parseInt(countResult[0].total);

    logger.businessEvent('documents_retrieved', 'document', 'multiple', req.user?.id || 'system', {
      page: Number(page),
      limit: Number(limit),
      total,
      filters: { search, category, fileType, caseId, clientId }
    });

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error getting documents', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve documents'
      }
    });
  }
}

/**
 * Get document by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getDocumentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DOCUMENT_ID',
          message: 'Document ID is required'
        }
      });
      return;
    }
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view documents'
        }
      });
      return;
    }

    const document = await db.getDocumentById(id);
    
    if (!document) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
      return;
    }

    // Get document versions
    const versions = await db.query(`
      SELECT 
        id, version, file_name, file_size, created_at, uploaded_by
      FROM document_versions 
      WHERE document_id = $1 
      ORDER BY version DESC
    `, [id]);

    // Get document audit logs
    const auditLogs = await db.query(`
      SELECT 
        action, old_values, new_values, created_at, user_id
      FROM audit_logs 
      WHERE resource_type = 'document' AND resource_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    logger.businessEvent('document_retrieved', 'document', id, req.user?.id || 'system');

    res.json({
      success: true,
      data: { 
        document,
        versions,
        auditLogs
      }
    });
  } catch (error) {
    logger.error('Error getting document by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve document'
      }
    });
  }
}

/**
 * Upload new document
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const uploadDocument = [
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, description, category, tags, caseId, clientId, isPublic } = req.body;
      
      // Check permissions
      if (!hasPermission(req.user?.role as UserRole, 'document:create')) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to upload documents'
          }
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No file provided'
          }
        });
        return;
      }

      // Validate case exists (if provided)
      if (caseId && caseId.trim() !== '') {
        const caseData = await db.getCaseById(caseId);
        if (!caseData) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CASE_NOT_FOUND',
              message: 'Case not found'
            }
          });
          return;
        }
      }

      // Validate client exists (if provided)
      if (clientId) {
        const client = await db.getClientById(clientId);
        if (!client) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CLIENT_NOT_FOUND',
              message: 'Client not found'
            }
          });
          return;
        }
      }

      // Create document
      const document = await db.createDocument({
        title: title || req.file.originalname,
        description,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        category: category || 'general',
        tags: tags ? JSON.parse(tags) : [],
        caseId,
        clientId,
        uploadedBy: req.user?.id || 'system',
        isPublic: isPublic === 'true'
      });

      logger.businessEvent('document_uploaded', 'document', document.id, req.user?.id || 'system', {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        caseId,
        clientId,
        uploadedBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: { document }
      });
    } catch (error) {
      logger.error('Error uploading document', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload document'
        }
      });
    }
  }
];

/**
 * Update document metadata
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function updateDocument(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isPublic } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DOCUMENT_ID',
          message: 'Document ID is required'
        }
      });
      return;
    }
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:update')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update documents'
        }
      });
      return;
    }

    // Get existing document
    const existingDocument = await db.getDocumentById(id);
    if (!existingDocument) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
      return;
    }

    // Update document
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (tags) updateData.tags = JSON.parse(tags);
    if (isPublic !== undefined) updateData.isPublic = isPublic === 'true';

    const document = await db.updateDocument(id, updateData);

    logger.businessEvent('document_updated', 'document', id, req.user?.id || 'system', {
      updatedFields: Object.keys(updateData),
      updatedBy: req.user?.id
    });

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    logger.error('Error updating document', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update document'
      }
    });
  }
}

/**
 * Delete document (soft delete)
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function deleteDocument(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DOCUMENT_ID',
          message: 'Document ID is required'
        }
      });
      return;
    }
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:delete')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete documents'
        }
      });
      return;
    }

    // Get existing document
    const existingDocument = await db.getDocumentById(id);
    if (!existingDocument) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
      return;
    }

    // Soft delete document
    await db.query('UPDATE documents SET is_deleted = true, updated_at = NOW() WHERE id = $1', [id]);

    logger.businessEvent('document_deleted', 'document', id, req.user?.id || 'system', {
      deletedDocument: existingDocument.file_name,
      deletedBy: req.user?.id
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting document', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete document'
      }
    });
  }
}

/**
 * Download document
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function downloadDocument(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DOCUMENT_ID',
          message: 'Document ID is required'
        }
      });
      return;
    }
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to download documents'
        }
      });
      return;
    }

    const document = await db.getDocumentById(id);
    
    if (!document) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found'
        }
      });
      return;
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found on server'
        }
      });
      return;
    }

    // Log download
    logger.businessEvent('document_downloaded', 'document', id, req.user?.id || 'system');

    // Send file
    res.download(document.file_path, document.file_name);
  } catch (error) {
    logger.error('Error downloading document', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download document'
      }
    });
  }
}

/**
 * Search documents with full-text search
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function searchDocuments(req: Request, res: Response): Promise<void> {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: 'Search query is required'
        }
      });
      return;
    }
    
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to search documents'
        }
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    // Full-text search
    const documents = await db.query(`
      SELECT 
        d.id, d.title, d.description, d.file_name, d.file_size, d.file_type,
        d.category, d.tags, d.version, d.created_at,
        c.case_number, c.title as case_title,
        cl.first_name as client_first_name, cl.last_name as client_last_name,
        ts_rank(to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')), plainto_tsquery('english', $1)) as rank
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      WHERE d.is_deleted = false
      AND to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC, d.created_at DESC
      LIMIT $2 OFFSET $3
    `, [q as string, Number(limit), offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM documents d
      WHERE d.is_deleted = false
      AND to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', $1)
    `, [q]);

    const total = parseInt(countResult[0].total);

    logger.businessEvent('documents_searched', 'document', 'search', req.user?.id || 'system', {
      query: q,
      results: documents.length,
      total
    });

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        },
        query: q
      }
    });
  } catch (error) {
    logger.error('Error searching documents', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search documents'
      }
    });
  }
}

/**
 * Get document statistics
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getDocumentStats(req: Request, res: Response): Promise<void> {
  try {
    // Check permissions
    if (!hasPermission(req.user?.role as UserRole, 'document:read')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view document statistics'
        }
      });
      return;
    }

    // Get total documents
    const totalDocuments = await db.query('SELECT COUNT(*) as count FROM documents WHERE is_deleted = false');
    
    // Get documents by category
    const documentsByCategory = await db.query(`
      SELECT category, COUNT(*) as count
      FROM documents 
      WHERE is_deleted = false
      GROUP BY category
      ORDER BY count DESC
    `);

    // Get documents by file type
    const documentsByType = await db.query(`
      SELECT file_type, COUNT(*) as count
      FROM documents 
      WHERE is_deleted = false
      GROUP BY file_type
      ORDER BY count DESC
    `);

    // Get total storage used
    const totalStorage = await db.query(`
      SELECT COALESCE(SUM(file_size), 0) as total_size
      FROM documents 
      WHERE is_deleted = false
    `);

    // Get recent uploads
    const recentUploads = await db.query(`
      SELECT 
        d.id, d.title, d.file_name, d.file_size, d.created_at,
        u.first_name, u.last_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.is_deleted = false
      ORDER BY d.created_at DESC
      LIMIT 10
    `);

    logger.businessEvent('document_stats_retrieved', 'document', 'statistics', req.user?.id || 'system');

    res.json({
      success: true,
      data: {
        totalDocuments: parseInt(totalDocuments[0].count),
        documentsByCategory,
        documentsByType,
        totalStorage: parseInt(totalStorage[0].total_size),
        recentUploads
      }
    });
  } catch (error) {
    logger.error('Error getting document statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve document statistics'
      }
    });
  }
}

export default {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  searchDocuments,
  getDocumentStats
};