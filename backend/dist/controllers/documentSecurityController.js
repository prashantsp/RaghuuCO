"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDocumentAccess = exports.getDocumentAuditLog = exports.getDocumentSecurityMetadata = exports.updateDocumentSecurity = exports.downloadSecureDocument = exports.uploadSecureDocument = void 0;
const documentSecurityService_1 = require("@/services/documentSecurityService");
const logger_1 = __importDefault(require("@/utils/logger"));
const uploadSecureDocument = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, description, caseId, clientId, securityLevel, watermarkText, watermarkPosition } = req.body;
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
        logger_1.default.info('Uploading secure document', { userId, title, securityLevel });
        const documentId = crypto.randomUUID();
        const fileName = `${documentId}${path.extname(file.originalname)}`;
        await documentSecurityService_1.documentSecurityService.saveSecureDocument(fileName, file.buffer, securityLevel || 'internal', watermarkText, watermarkPosition || 'bottom_right');
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
        logger_1.default.businessEvent('secure_document_uploaded', 'document', document.id, userId);
        return res.status(201).json({
            success: true,
            data: { document }
        });
    }
    catch (error) {
        logger_1.default.error('Error uploading secure document', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SECURE_DOCUMENT_UPLOAD_ERROR',
                message: 'Failed to upload secure document'
            }
        });
    }
};
exports.uploadSecureDocument = uploadSecureDocument;
const downloadSecureDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DOCUMENT_ID',
                    message: 'Document ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Downloading secure document', { userId, documentId: id });
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
        const documentContent = await documentSecurityService_1.documentSecurityService.getSecureDocument(id, userId);
        res.setHeader('Content-Type', document.file_type);
        res.setHeader('Content-Disposition', `attachment; filename="${document.title}"`);
        res.setHeader('Content-Length', documentContent.length);
        res.send(documentContent);
        logger_1.default.businessEvent('secure_document_downloaded', 'document', id, userId);
        return;
    }
    catch (error) {
        logger_1.default.error('Error downloading secure document', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SECURE_DOCUMENT_DOWNLOAD_ERROR',
                message: 'Failed to download secure document'
            }
        });
    }
};
exports.downloadSecureDocument = downloadSecureDocument;
const updateDocumentSecurity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { securityLevel, watermarkText, watermarkPosition } = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DOCUMENT_ID',
                    message: 'Document ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Updating document security settings', { userId, documentId: id });
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
        await documentSecurityService_1.documentSecurityService.updateDocumentSecurity(id, securityLevel, watermarkText, watermarkPosition);
        await db.query(`
      UPDATE documents SET security_level = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id, securityLevel]);
        logger_1.default.businessEvent('document_security_updated', 'document', id, userId);
        return res.json({
            success: true,
            message: 'Document security settings updated successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error updating document security', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'DOCUMENT_SECURITY_UPDATE_ERROR',
                message: 'Failed to update document security settings'
            }
        });
    }
};
exports.updateDocumentSecurity = updateDocumentSecurity;
const getDocumentSecurityMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DOCUMENT_ID',
                    message: 'Document ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Getting document security metadata', { userId, documentId: id });
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
        const securityMetadata = await documentSecurityService_1.documentSecurityService.getDocumentSecurityMetadata(id);
        return res.json({
            success: true,
            data: {
                document,
                security: securityMetadata
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting document security metadata', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'DOCUMENT_SECURITY_METADATA_ERROR',
                message: 'Failed to get document security metadata'
            }
        });
    }
};
exports.getDocumentSecurityMetadata = getDocumentSecurityMetadata;
const getDocumentAuditLog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DOCUMENT_ID',
                    message: 'Document ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Getting document audit log', { documentId: id, userId });
        const result = await documentSecurityService_1.documentSecurityService.getDocumentAuditLog(id);
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting document audit log', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'DOCUMENT_AUDIT_LOG_ERROR',
                message: 'Failed to get document audit log'
            }
        });
    }
};
exports.getDocumentAuditLog = getDocumentAuditLog;
const checkDocumentAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DOCUMENT_ID',
                    message: 'Document ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Checking document access permissions', { documentId: id, userId });
        const result = await documentSecurityService_1.documentSecurityService.checkDocumentAccess(id, userId);
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error checking document access', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'DOCUMENT_ACCESS_CHECK_ERROR',
                message: 'Failed to check document access'
            }
        });
    }
};
exports.checkDocumentAccess = checkDocumentAccess;
exports.default = {
    uploadSecureDocument: exports.uploadSecureDocument,
    downloadSecureDocument: exports.downloadSecureDocument,
    updateDocumentSecurity: exports.updateDocumentSecurity,
    getDocumentSecurityMetadata: exports.getDocumentSecurityMetadata,
    getDocumentAuditLog: exports.getDocumentAuditLog,
    checkDocumentAccess: exports.checkDocumentAccess
};
//# sourceMappingURL=documentSecurityController.js.map