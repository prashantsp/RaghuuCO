/**
 * Notification Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Notification service for in-app notifications, push notifications, and alerts
 */

import { DatabaseService } from '../services/DatabaseService';
import logger from './logger';
import emailService from './emailService';

/**
 * Notification types
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TASK_ASSIGNMENT = 'task_assignment',
  CASE_UPDATE = 'case_update',
  DOCUMENT_UPLOAD = 'document_upload',
  INVOICE_GENERATED = 'invoice_generated',
  PAYMENT_RECEIVED = 'payment_received',
  SYSTEM_ALERT = 'system_alert'
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

/**
 * Notification service class
 */
class NotificationService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const sql = `
        INSERT INTO notifications (
          id, user_id, type, priority, title, message, data, is_read, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      
      await this.db.query(sql, [
        notificationId,
        userId,
        type,
        priority,
        title,
        message,
        data ? JSON.stringify(data) : null,
        false,
        new Date()
      ]);

      logger.info('Notification created', { notificationId, userId, type });
      return notificationId;
    } catch (error) {
      logger.error('Failed to create notification:', error as Error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let sql = `
        SELECT * FROM notifications 
        WHERE user_id = $1
      `;
      
      const params: any[] = [userId];
      
      if (unreadOnly) {
        sql += ' AND is_read = false';
      }
      
      sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
      
      const result = await this.db.query(sql, params);
      
      return result.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type as NotificationType,
        priority: row.priority as NotificationPriority,
        title: row.title,
        message: row.message,
        data: row.data ? JSON.parse(row.data) : undefined,
        isRead: row.is_read,
        createdAt: new Date(row.created_at),
        readAt: row.read_at ? new Date(row.read_at) : undefined
      }));
    } catch (error) {
      logger.error('Failed to get user notifications:', error as Error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const sql = `
        UPDATE notifications 
        SET is_read = true, read_at = $1 
        WHERE id = $2 AND user_id = $3
      `;
      
      await this.db.query(sql, [new Date(), notificationId, userId]);
      logger.info('Notification marked as read', { notificationId, userId });
    } catch (error) {
      logger.error('Failed to mark notification as read:', error as Error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const sql = `
        UPDATE notifications 
        SET is_read = true, read_at = $1 
        WHERE user_id = $2 AND is_read = false
      `;
      
      await this.db.query(sql, [new Date(), userId]);
      logger.info('All notifications marked as read', { userId });
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error as Error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const sql = `
        DELETE FROM notifications 
        WHERE id = $1 AND user_id = $2
      `;
      
      await this.db.query(sql, [notificationId, userId]);
      logger.info('Notification deleted', { notificationId, userId });
    } catch (error) {
      logger.error('Failed to delete notification:', error as Error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const sql = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = $1 AND is_read = false
      `;
      
      const result = await this.db.query(sql, [userId]);
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      logger.error('Failed to get unread count:', error as Error);
      return 0;
    }
  }

  /**
   * Send task assignment notification
   */
  async sendTaskAssignmentNotification(
    userId: string,
    taskTitle: string,
    assignedBy: string,
    taskId: string
  ): Promise<void> {
    try {
      // Create in-app notification
      await this.createNotification(
        userId,
        NotificationType.TASK_ASSIGNMENT,
        NotificationPriority.MEDIUM,
        'New Task Assigned',
        `You have been assigned a new task: ${taskTitle}`,
        { taskId, assignedBy }
      );

      // Send email notification
      const userEmail = await this.getUserEmail(userId);
      if (userEmail) {
        await emailService.sendTaskAssignmentNotification(userEmail, taskTitle, assignedBy);
      }
    } catch (error) {
      logger.error('Failed to send task assignment notification:', error as Error);
    }
  }

  /**
   * Send case update notification
   */
  async sendCaseUpdateNotification(
    userId: string,
    caseNumber: string,
    updateType: string,
    caseId: string
  ): Promise<void> {
    try {
      // Create in-app notification
      await this.createNotification(
        userId,
        NotificationType.CASE_UPDATE,
        NotificationPriority.MEDIUM,
        'Case Update',
        `Case ${caseNumber} has been updated: ${updateType}`,
        { caseId, updateType }
      );

      // Send email notification
      const userEmail = await this.getUserEmail(userId);
      if (userEmail) {
        await emailService.sendCaseUpdateNotification(userEmail, caseNumber, updateType);
      }
    } catch (error) {
      logger.error('Failed to send case update notification:', error as Error);
    }
  }

  /**
   * Send document upload notification
   */
  async sendDocumentUploadNotification(
    userId: string,
    documentTitle: string,
    caseNumber: string,
    documentId: string
  ): Promise<void> {
    try {
      await this.createNotification(
        userId,
        NotificationType.DOCUMENT_UPLOAD,
        NotificationPriority.LOW,
        'Document Uploaded',
        `Document "${documentTitle}" has been uploaded for case ${caseNumber}`,
        { documentId, caseNumber }
      );
    } catch (error) {
      logger.error('Failed to send document upload notification:', error as Error);
    }
  }

  /**
   * Send invoice generated notification
   */
  async sendInvoiceGeneratedNotification(
    userId: string,
    invoiceNumber: string,
    amount: number,
    invoiceId: string
  ): Promise<void> {
    try {
      // Create in-app notification
      await this.createNotification(
        userId,
        NotificationType.INVOICE_GENERATED,
        NotificationPriority.HIGH,
        'Invoice Generated',
        `Invoice ${invoiceNumber} has been generated for ₹${amount.toLocaleString()}`,
        { invoiceId, amount }
      );

      // Send email notification
      const userEmail = await this.getUserEmail(userId);
      if (userEmail) {
        await emailService.sendInvoiceNotification(userEmail, invoiceNumber, amount);
      }
    } catch (error) {
      logger.error('Failed to send invoice generated notification:', error as Error);
    }
  }

  /**
   * Send system alert to all admins
   */
  async sendSystemAlertToAdmins(
    alertType: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.HIGH
  ): Promise<void> {
    try {
      // Get all admin users
      const adminUsers = await this.getAdminUsers();
      
      for (const admin of adminUsers) {
        await this.createNotification(
          admin.id,
          NotificationType.SYSTEM_ALERT,
          priority,
          `System Alert: ${alertType}`,
          message,
          { alertType }
        );
      }

      // Send email to admin emails
      const adminEmails = adminUsers.map(user => user.email).filter(Boolean);
      if (adminEmails.length > 0) {
        await emailService.sendSystemAlert(adminEmails, alertType, message);
      }
    } catch (error) {
      logger.error('Failed to send system alert to admins:', error as Error);
    }
  }

  /**
   * Get user email
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      const sql = 'SELECT email FROM users WHERE id = $1';
      const result = await this.db.query(sql, [userId]);
      return result[0]?.email || null;
    } catch (error) {
      logger.error('Failed to get user email:', error as Error);
      return null;
    }
  }

  /**
   * Get admin users
   */
  private async getAdminUsers(): Promise<Array<{ id: string; email: string }>> {
    try {
      const sql = `
        SELECT id, email 
        FROM users 
        WHERE role IN ('super_admin', 'partner') AND is_active = true
      `;
      
      const result = await this.db.query(sql);
      return result.map(row => ({
        id: row.id,
        email: row.email
      }));
    } catch (error) {
      logger.error('Failed to get admin users:', error as Error);
      return [];
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export functions for backward compatibility
export const sendNotification = (
  userId: string,
  type: NotificationType,
  priority: NotificationPriority,
  title: string,
  message: string,
  data?: Record<string, any>
) => notificationService.createNotification(userId, type, priority, title, message, data);

export const sendTaskAssignmentNotification = (
  userId: string,
  taskTitle: string,
  assignedBy: string,
  taskId: string
) => notificationService.sendTaskAssignmentNotification(userId, taskTitle, assignedBy, taskId);

export const sendCaseUpdateNotification = (
  userId: string,
  caseNumber: string,
  updateType: string,
  caseId: string
) => notificationService.sendCaseUpdateNotification(userId, caseNumber, updateType, caseId);

export const sendDocumentUploadNotification = (
  userId: string,
  documentTitle: string,
  caseNumber: string,
  documentId: string
) => notificationService.sendDocumentUploadNotification(userId, documentTitle, caseNumber, documentId);

export const sendInvoiceGeneratedNotification = (
  userId: string,
  invoiceNumber: string,
  amount: number,
  invoiceId: string
) => notificationService.sendInvoiceGeneratedNotification(userId, invoiceNumber, amount, invoiceId);

export const sendSystemAlertToAdmins = (
  alertType: string,
  message: string,
  priority?: NotificationPriority
) => notificationService.sendSystemAlertToAdmins(alertType, message, priority);

export default notificationService;