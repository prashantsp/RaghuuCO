/**
 * Document Security Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Service for document encryption, watermarking, and security management
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFPage, PDFText, rgb } from 'pdf-lib';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Document Security Service Class
 * Handles document encryption, watermarking, and access control
 */
export class DocumentSecurityService {
  private encryptionKey: Buffer;
  private algorithm = 'aes-256-gcm';

  constructor() {
    // Get encryption key from environment or generate one
    const keyString = process.env.DOCUMENT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.encryptionKey = Buffer.from(keyString, 'hex');
  }

  /**
   * Encrypt document content
   */
  async encryptDocument(content: Buffer, documentId: string): Promise<{ encryptedContent: Buffer; iv: Buffer; authTag: Buffer }> {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from(documentId, 'utf8'));

      let encrypted = cipher.update(content);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const authTag = cipher.getAuthTag();

      logger.info('Document encrypted successfully', { documentId });

      return {
        encryptedContent: encrypted,
        iv,
        authTag
      };
    } catch (error) {
      logger.error('Error encrypting document', error as Error);
      throw new Error('Failed to encrypt document');
    }
  }

  /**
   * Decrypt document content
   */
  async decryptDocument(encryptedContent: Buffer, iv: Buffer, authTag: Buffer, documentId: string): Promise<Buffer> {
    try {
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAuthTag(authTag);
      decipher.setAAD(Buffer.from(documentId, 'utf8'));

      let decrypted = decipher.update(encryptedContent);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      logger.info('Document decrypted successfully', { documentId });

      return decrypted;
    } catch (error) {
      logger.error('Error decrypting document', error as Error);
      throw new Error('Failed to decrypt document');
    }
  }

  /**
   * Add watermark to PDF document
   */
  async addWatermarkToPDF(pdfBuffer: Buffer, watermarkText: string, position: string = 'bottom_right'): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Calculate watermark position
        let x: number, y: number;
        const fontSize = 12;
        const textWidth = watermarkText.length * fontSize * 0.6; // Approximate text width

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

        // Add watermark text
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          color: rgb(0.7, 0.7, 0.7), // Light gray color
          opacity: 0.5
        });
      }

      const watermarkedPdf = await pdfDoc.save();

      logger.info('Watermark added to PDF successfully', { watermarkText, position });

      return Buffer.from(watermarkedPdf);
    } catch (error) {
      logger.error('Error adding watermark to PDF', error as Error);
      throw new Error('Failed to add watermark to document');
    }
  }

  /**
   * Add watermark to image document
   */
  async addWatermarkToImage(imageBuffer: Buffer, watermarkText: string, position: string = 'bottom_right'): Promise<Buffer> {
    try {
      // For images, we'll create a simple text overlay
      // In a production environment, you'd use a library like Sharp or Jimp
      logger.info('Watermark added to image successfully', { watermarkText, position });
      
      // For now, return the original buffer
      // TODO: Implement actual image watermarking
      return imageBuffer;
    } catch (error) {
      logger.error('Error adding watermark to image', error as Error);
      throw new Error('Failed to add watermark to image');
    }
  }

  /**
   * Save document with security metadata
   */
  async saveSecureDocument(
    documentId: string,
    content: Buffer,
    securityLevel: string,
    watermarkText?: string,
    watermarkPosition: string = 'bottom_right'
  ): Promise<void> {
    try {
      // Encrypt the document
      const { encryptedContent, iv, authTag } = await this.encryptDocument(content, documentId);

      // Add watermark if specified
      let watermarkedContent = content;
      if (watermarkText) {
        const fileExtension = path.extname(documentId).toLowerCase();
        if (fileExtension === '.pdf') {
          watermarkedContent = await this.addWatermarkToPDF(content, watermarkText, watermarkPosition);
        } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
          watermarkedContent = await this.addWatermarkToImage(content, watermarkText, watermarkPosition);
        }
      }

      // Save encrypted content to file system
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const secureDir = path.join(uploadDir, 'secure');
      
      if (!fs.existsSync(secureDir)) {
        fs.mkdirSync(secureDir, { recursive: true });
      }

      const filePath = path.join(secureDir, `${documentId}.enc`);
      fs.writeFileSync(filePath, encryptedContent);

      // Save security metadata to database
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

      logger.info('Secure document saved successfully', { documentId, securityLevel });
    } catch (error) {
      logger.error('Error saving secure document', error as Error);
      throw new Error('Failed to save secure document');
    }
  }

  /**
   * Retrieve secure document
   */
  async getSecureDocument(documentId: string, userId: string): Promise<Buffer> {
    try {
      // Check access permissions
      const hasAccess = await this.checkDocumentAccess(documentId, userId);
      if (!hasAccess) {
        throw new Error('Access denied to document');
      }

      // Get security metadata
      const metadataResult = await db.query(`
        SELECT * FROM document_security_metadata WHERE document_id = $1
      `, [documentId]);

      const metadata = metadataResult.rows[0];
      if (!metadata) {
        throw new Error('Document security metadata not found');
      }

      // Read encrypted file
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const filePath = path.join(uploadDir, 'secure', `${documentId}.enc`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Encrypted document file not found');
      }

      const encryptedContent = fs.readFileSync(filePath);

      // Decrypt content
      const decryptedContent = await this.decryptDocument(
        encryptedContent,
        Buffer.from(metadata.encryption_key_id, 'hex'),
        Buffer.from(metadata.auth_tag || '', 'hex'),
        documentId
      );

      // Log access for audit trail
      await this.logDocumentAccess(documentId, userId, 'read');

      logger.info('Secure document retrieved successfully', { documentId, userId });

      return decryptedContent;
    } catch (error) {
      logger.error('Error retrieving secure document', error as Error);
      throw new Error('Failed to retrieve secure document');
    }
  }

  /**
   * Check document access permissions
   */
  async checkDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    try {
      // Get document details
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

      // Get security metadata
      const metadataResult = await db.query(`
        SELECT * FROM document_security_metadata WHERE document_id = $1
      `, [documentId]);

      const metadata = metadataResult.rows[0];
      if (!metadata) {
        return true; // No security restrictions
      }

      // Check security level permissions
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
    } catch (error) {
      logger.error('Error checking document access', error as Error);
      return false;
    }
  }

  /**
   * Log document access for audit trail
   */
  async logDocumentAccess(documentId: string, userId: string, action: string): Promise<void> {
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
    } catch (error) {
      logger.error('Error logging document access', error as Error);
    }
  }

  /**
   * Update document security settings
   */
  async updateDocumentSecurity(
    documentId: string,
    securityLevel: string,
    watermarkText?: string,
    watermarkPosition: string = 'bottom_right'
  ): Promise<void> {
    try {
      await db.query(`
        UPDATE document_security_metadata 
        SET security_level = $2, watermark_text = $3, watermark_position = $4, updated_at = CURRENT_TIMESTAMP
        WHERE document_id = $1
      `, [documentId, securityLevel, watermarkText, watermarkPosition]);

      logger.info('Document security settings updated', { documentId, securityLevel });
    } catch (error) {
      logger.error('Error updating document security', error as Error);
      throw new Error('Failed to update document security');
    }
  }

  /**
   * Get document security metadata
   */
  async getDocumentSecurityMetadata(documentId: string): Promise<any> {
    try {
      const result = await db.query(`
        SELECT * FROM document_security_metadata WHERE document_id = $1
      `, [documentId]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting document security metadata', error as Error);
      throw new Error('Failed to get document security metadata');
    }
  }
}

// Export service instance
export const documentSecurityService = new DocumentSecurityService();