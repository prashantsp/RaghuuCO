"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentSecurityService = exports.DocumentSecurityService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const sharp_1 = __importDefault(require("sharp"));
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
class DocumentSecurityService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        const keyString = process.env["DOCUMENT_ENCRYPTION_KEY"] || crypto_1.default.randomBytes(32).toString('hex');
        this.encryptionKey = Buffer.from(keyString, 'hex');
    }
    async encryptDocument(content, documentId) {
        try {
            const iv = crypto_1.default.randomBytes(16);
            const cipher = crypto_1.default.createCipher(this.algorithm, this.encryptionKey);
            let encrypted = cipher.update(content);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            logger_1.default.info('Document encrypted successfully', { documentId });
            return {
                encryptedContent: encrypted,
                iv,
                authTag
            };
        }
        catch (error) {
            logger_1.default.error('Error encrypting document', error);
            throw new Error('Failed to encrypt document');
        }
    }
    async decryptDocument(encryptedContent, _iv, _authTag, documentId) {
        try {
            const decipher = crypto_1.default.createDecipher(this.algorithm, this.encryptionKey);
            let decrypted = decipher.update(encryptedContent);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            logger_1.default.info('Document decrypted successfully', { documentId });
            return decrypted;
        }
        catch (error) {
            logger_1.default.error('Error decrypting document', error);
            throw new Error('Failed to decrypt document');
        }
    }
    async addWatermarkToPDF(pdfBuffer, watermarkText, position = 'bottom_right') {
        try {
            const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBuffer);
            const pages = pdfDoc.getPages();
            for (const page of pages) {
                const { width, height } = page.getSize();
                let x, y;
                const fontSize = 12;
                const textWidth = watermarkText.length * fontSize * 0.6;
                switch (position) {
                    case 'top_left':
                        x = 20;
                        y = height - 30;
                        break;
                    case 'top_right':
                        x = width - textWidth - 20;
                        y = height - 30;
                        break;
                    case 'bottom_left':
                        x = 20;
                        y = 30;
                        break;
                    case 'bottom_right':
                    default:
                        x = width - textWidth - 20;
                        y = 30;
                        break;
                    case 'center':
                        x = (width - textWidth) / 2;
                        y = height / 2;
                        break;
                }
                page.drawText(watermarkText, {
                    x,
                    y,
                    size: fontSize,
                    color: (0, pdf_lib_1.rgb)(0.7, 0.7, 0.7),
                    opacity: 0.5
                });
            }
            const watermarkedPdf = await pdfDoc.save();
            logger_1.default.info('Watermark added to PDF successfully', { watermarkText, position });
            return Buffer.from(watermarkedPdf);
        }
        catch (error) {
            logger_1.default.error('Error adding watermark to PDF', error);
            throw new Error('Failed to add watermark to document');
        }
    }
    async addWatermarkToImage(imageBuffer, watermarkText, position = 'bottom_right') {
        try {
            logger_1.default.info('Adding watermark to image', { watermarkText, position });
            const watermarkSvg = `
        <svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          <text x="150" y="50" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                fill="rgba(255,255,255,0.8)" 
                text-anchor="middle" 
                filter="url(#shadow)"
                transform="rotate(-45 150 50)">
            ${watermarkText}
          </text>
        </svg>
      `;
            const imageInfo = await (0, sharp_1.default)(imageBuffer).metadata();
            const { width = 800, height = 600 } = imageInfo;
            let watermarkX, watermarkY;
            const watermarkWidth = 300;
            const watermarkHeight = 100;
            switch (position) {
                case 'top_left':
                    watermarkX = 20;
                    watermarkY = 20;
                    break;
                case 'top_right':
                    watermarkX = width - watermarkWidth - 20;
                    watermarkY = 20;
                    break;
                case 'bottom_left':
                    watermarkX = 20;
                    watermarkY = height - watermarkHeight - 20;
                    break;
                case 'bottom_right':
                default:
                    watermarkX = width - watermarkWidth - 20;
                    watermarkY = height - watermarkHeight - 20;
                    break;
                case 'center':
                    watermarkX = (width - watermarkWidth) / 2;
                    watermarkY = (height - watermarkHeight) / 2;
                    break;
            }
            const watermarkedImage = await (0, sharp_1.default)(imageBuffer)
                .composite([
                {
                    input: Buffer.from(watermarkSvg),
                    top: Math.round(watermarkY),
                    left: Math.round(watermarkX)
                }
            ])
                .png()
                .toBuffer();
            logger_1.default.info('Image watermark added successfully', { watermarkText, position });
            return watermarkedImage;
        }
        catch (error) {
            logger_1.default.error('Error adding watermark to image', error);
            throw new Error('Failed to add watermark to image');
        }
    }
    async saveSecureDocument(documentId, content, securityLevel, watermarkText, watermarkPosition = 'bottom_right') {
        try {
            const { encryptedContent } = await this.encryptDocument(content, documentId);
            if (watermarkText) {
                const fileExtension = path_1.default.extname(documentId).toLowerCase();
                if (fileExtension === '.pdf') {
                    watermarkedContent = await this.addWatermarkToPDF(content, watermarkText, watermarkPosition);
                }
                else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
                    watermarkedContent = await this.addWatermarkToImage(content, watermarkText, watermarkPosition);
                }
            }
            const uploadDir = process.env["UPLOAD_DIR"] || 'uploads';
            const secureDir = path_1.default.join(uploadDir, 'secure');
            if (!fs_1.default.existsSync(secureDir)) {
                fs_1.default.mkdirSync(secureDir, { recursive: true });
            }
            const filePath = path_1.default.join(secureDir, `${documentId}.enc`);
            fs_1.default.writeFileSync(filePath, encryptedContent);
            await db.query(`
        INSERT INTO document_security_metadata 
        (document_id, security_level, encrypted_at_rest, encryption_key_id, watermark_text, watermark_position, audit_trail_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (document_id) 
        DO UPDATE SET 
          security_level = $2,
          encrypted_at_rest = $3,
          encryption_key_id = $4,
          watermark_text = $5,
          watermark_position = $6,
          audit_trail_enabled = $7,
          updated_at = CURRENT_TIMESTAMP
      `, [
                documentId,
                securityLevel,
                true,
                this.encryptionKey.toString('hex').substring(0, 32),
                watermarkText || null,
                watermarkPosition,
                true
            ]);
            logger_1.default.info('Secure document saved successfully', { documentId, securityLevel });
        }
        catch (error) {
            logger_1.default.error('Error saving secure document', error);
            throw new Error('Failed to save secure document');
        }
    }
    async getSecureDocument(documentId, userId) {
        try {
            const hasAccess = await this.checkDocumentAccess(documentId, userId);
            if (!hasAccess) {
                throw new Error('Access denied to document');
            }
            const metadataResult = await db.query(`
        SELECT * FROM document_security_metadata WHERE document_id = $1
      `, [documentId]);
            const metadata = metadataResult.rows[0];
            if (!metadata) {
                throw new Error('Document security metadata not found');
            }
            const uploadDir = process.env["UPLOAD_DIR"] || 'uploads';
            const filePath = path_1.default.join(uploadDir, 'secure', `${documentId}.enc`);
            if (!fs_1.default.existsSync(filePath)) {
                throw new Error('Encrypted document file not found');
            }
            const encryptedContent = fs_1.default.readFileSync(filePath);
            const decryptedContent = await this.decryptDocument(encryptedContent, Buffer.from(metadata.encryption_key_id, 'hex'), Buffer.from(metadata.auth_tag || '', 'hex'), documentId);
            await this.logDocumentAccess(documentId, userId, 'read');
            logger_1.default.info('Secure document retrieved successfully', { documentId, userId });
            return decryptedContent;
        }
        catch (error) {
            logger_1.default.error('Error retrieving secure document', error);
            throw new Error('Failed to retrieve secure document');
        }
    }
    async checkDocumentAccess(documentId, userId) {
        try {
            const documentResult = await db.query(`
        SELECT d.*, u.role, u.id as user_id
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.id = $1
      `, [documentId]);
            const document = documentResult.rows[0];
            if (!document) {
                return false;
            }
            const metadataResult = await db.query(`
        SELECT * FROM document_security_metadata WHERE document_id = $1
      `, [documentId]);
            const metadata = metadataResult.rows[0];
            if (!metadata) {
                return true;
            }
            switch (metadata.security_level) {
                case 'public':
                    return true;
                case 'internal':
                    return document.user_id === userId || ['admin', 'partner', 'associate'].includes(document.role);
                case 'confidential':
                    return document.user_id === userId || ['admin', 'partner'].includes(document.role);
                case 'restricted':
                    return document.user_id === userId || document.role === 'admin';
                default:
                    return false;
            }
        }
        catch (error) {
            logger_1.default.error('Error checking document access', error);
            return false;
        }
    }
    async logDocumentAccess(documentId, userId, action) {
        try {
            await db.query(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
                userId,
                action,
                'document',
                documentId,
                JSON.stringify({ timestamp: new Date().toISOString() })
            ]);
        }
        catch (error) {
            logger_1.default.error('Error logging document access', error);
        }
    }
    async updateDocumentSecurity(documentId, securityLevel, watermarkText, watermarkPosition = 'bottom_right') {
        try {
            await db.query(`
        UPDATE document_security_metadata 
        SET security_level = $2, watermark_text = $3, watermark_position = $4, updated_at = CURRENT_TIMESTAMP
        WHERE document_id = $1
      `, [documentId, securityLevel, watermarkText, watermarkPosition]);
            logger_1.default.info('Document security settings updated', { documentId, securityLevel });
        }
        catch (error) {
            logger_1.default.error('Error updating document security', error);
            throw new Error('Failed to update document security');
        }
    }
    async getDocumentSecurityMetadata(documentId) {
        try {
            const result = await db.query(`
        SELECT * FROM document_security_metadata WHERE document_id = $1
      `, [documentId]);
            return result[0];
        }
        catch (error) {
            logger_1.default.error('Error getting document security metadata', error);
            throw new Error('Failed to get document security metadata');
        }
    }
}
exports.DocumentSecurityService = DocumentSecurityService;
exports.documentSecurityService = new DocumentSecurityService();
//# sourceMappingURL=documentSecurityService.js.map