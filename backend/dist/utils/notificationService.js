"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSystemAlertToAdmins = exports.sendInvoiceGeneratedNotification = exports.sendDocumentUploadNotification = exports.sendCaseUpdateNotification = exports.sendTaskAssignmentNotification = exports.sendNotification = exports.NotificationPriority = exports.NotificationType = void 0;
const DatabaseService_1 = require("../services/DatabaseService");
const logger_1 = __importDefault(require("./logger"));
const emailService_1 = __importDefault(require("./emailService"));
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "info";
    NotificationType["SUCCESS"] = "success";
    NotificationType["WARNING"] = "warning";
    NotificationType["ERROR"] = "error";
    NotificationType["TASK_ASSIGNMENT"] = "task_assignment";
    NotificationType["CASE_UPDATE"] = "case_update";
    NotificationType["DOCUMENT_UPLOAD"] = "document_upload";
    NotificationType["INVOICE_GENERATED"] = "invoice_generated";
    NotificationType["PAYMENT_RECEIVED"] = "payment_received";
    NotificationType["SYSTEM_ALERT"] = "system_alert";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
class NotificationService {
    constructor() {
        this.db = new DatabaseService_1.DatabaseService();
    }
    async createNotification(userId, type, priority, title, message, data) {
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
            logger_1.default.info('Notification created', { notificationId, userId, type });
            return notificationId;
        }
        catch (error) {
            logger_1.default.error('Failed to create notification:', error);
            throw error;
        }
    }
    async getUserNotifications(userId, limit = 50, offset = 0, unreadOnly = false) {
        try {
            let sql = `
        SELECT * FROM notifications 
        WHERE user_id = $1
      `;
            const params = [userId];
            if (unreadOnly) {
                sql += ' AND is_read = false';
            }
            sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
            params.push(limit, offset);
            const result = await this.db.query(sql, params);
            return result.map(row => ({
                id: row.id,
                userId: row.user_id,
                type: row.type,
                priority: row.priority,
                title: row.title,
                message: row.message,
                data: row.data ? JSON.parse(row.data) : undefined,
                isRead: row.is_read,
                createdAt: new Date(row.created_at),
                readAt: row.read_at ? new Date(row.read_at) : undefined
            }));
        }
        catch (error) {
            logger_1.default.error('Failed to get user notifications:', error);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const sql = `
        UPDATE notifications 
        SET is_read = true, read_at = $1 
        WHERE id = $2 AND user_id = $3
      `;
            await this.db.query(sql, [new Date(), notificationId, userId]);
            logger_1.default.info('Notification marked as read', { notificationId, userId });
        }
        catch (error) {
            logger_1.default.error('Failed to mark notification as read:', error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            const sql = `
        UPDATE notifications 
        SET is_read = true, read_at = $1 
        WHERE user_id = $2 AND is_read = false
      `;
            await this.db.query(sql, [new Date(), userId]);
            logger_1.default.info('All notifications marked as read', { userId });
        }
        catch (error) {
            logger_1.default.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const sql = `
        DELETE FROM notifications 
        WHERE id = $1 AND user_id = $2
      `;
            await this.db.query(sql, [notificationId, userId]);
            logger_1.default.info('Notification deleted', { notificationId, userId });
        }
        catch (error) {
            logger_1.default.error('Failed to delete notification:', error);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const sql = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = $1 AND is_read = false
      `;
            const result = await this.db.query(sql, [userId]);
            return parseInt(result[0]?.count || '0');
        }
        catch (error) {
            logger_1.default.error('Failed to get unread count:', error);
            return 0;
        }
    }
    async sendTaskAssignmentNotification(userId, taskTitle, assignedBy, taskId) {
        try {
            await this.createNotification(userId, NotificationType.TASK_ASSIGNMENT, NotificationPriority.MEDIUM, 'New Task Assigned', `You have been assigned a new task: ${taskTitle}`, { taskId, assignedBy });
            const userEmail = await this.getUserEmail(userId);
            if (userEmail) {
                await emailService_1.default.sendTaskAssignmentNotification(userEmail, taskTitle, assignedBy);
            }
        }
        catch (error) {
            logger_1.default.error('Failed to send task assignment notification:', error);
        }
    }
    async sendCaseUpdateNotification(userId, caseNumber, updateType, caseId) {
        try {
            await this.createNotification(userId, NotificationType.CASE_UPDATE, NotificationPriority.MEDIUM, 'Case Update', `Case ${caseNumber} has been updated: ${updateType}`, { caseId, updateType });
            const userEmail = await this.getUserEmail(userId);
            if (userEmail) {
                await emailService_1.default.sendCaseUpdateNotification(userEmail, caseNumber, updateType);
            }
        }
        catch (error) {
            logger_1.default.error('Failed to send case update notification:', error);
        }
    }
    async sendDocumentUploadNotification(userId, documentTitle, caseNumber, documentId) {
        try {
            await this.createNotification(userId, NotificationType.DOCUMENT_UPLOAD, NotificationPriority.LOW, 'Document Uploaded', `Document "${documentTitle}" has been uploaded for case ${caseNumber}`, { documentId, caseNumber });
        }
        catch (error) {
            logger_1.default.error('Failed to send document upload notification:', error);
        }
    }
    async sendInvoiceGeneratedNotification(userId, invoiceNumber, amount, invoiceId) {
        try {
            await this.createNotification(userId, NotificationType.INVOICE_GENERATED, NotificationPriority.HIGH, 'Invoice Generated', `Invoice ${invoiceNumber} has been generated for ₹${amount.toLocaleString()}`, { invoiceId, amount });
            const userEmail = await this.getUserEmail(userId);
            if (userEmail) {
                await emailService_1.default.sendInvoiceNotification(userEmail, invoiceNumber, amount);
            }
        }
        catch (error) {
            logger_1.default.error('Failed to send invoice generated notification:', error);
        }
    }
    async sendSystemAlertToAdmins(alertType, message, priority = NotificationPriority.HIGH) {
        try {
            const adminUsers = await this.getAdminUsers();
            for (const admin of adminUsers) {
                await this.createNotification(admin.id, NotificationType.SYSTEM_ALERT, priority, `System Alert: ${alertType}`, message, { alertType });
            }
            const adminEmails = adminUsers.map(user => user.email).filter(Boolean);
            if (adminEmails.length > 0) {
                await emailService_1.default.sendSystemAlert(adminEmails, alertType, message);
            }
        }
        catch (error) {
            logger_1.default.error('Failed to send system alert to admins:', error);
        }
    }
    async getUserEmail(userId) {
        try {
            const sql = 'SELECT email FROM users WHERE id = $1';
            const result = await this.db.query(sql, [userId]);
            return result[0]?.email || null;
        }
        catch (error) {
            logger_1.default.error('Failed to get user email:', error);
            return null;
        }
    }
    async getAdminUsers() {
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
        }
        catch (error) {
            logger_1.default.error('Failed to get admin users:', error);
            return [];
        }
    }
}
const notificationService = new NotificationService();
const sendNotification = (userId, type, priority, title, message, data) => notificationService.createNotification(userId, type, priority, title, message, data);
exports.sendNotification = sendNotification;
const sendTaskAssignmentNotification = (userId, taskTitle, assignedBy, taskId) => notificationService.sendTaskAssignmentNotification(userId, taskTitle, assignedBy, taskId);
exports.sendTaskAssignmentNotification = sendTaskAssignmentNotification;
const sendCaseUpdateNotification = (userId, caseNumber, updateType, caseId) => notificationService.sendCaseUpdateNotification(userId, caseNumber, updateType, caseId);
exports.sendCaseUpdateNotification = sendCaseUpdateNotification;
const sendDocumentUploadNotification = (userId, documentTitle, caseNumber, documentId) => notificationService.sendDocumentUploadNotification(userId, documentTitle, caseNumber, documentId);
exports.sendDocumentUploadNotification = sendDocumentUploadNotification;
const sendInvoiceGeneratedNotification = (userId, invoiceNumber, amount, invoiceId) => notificationService.sendInvoiceGeneratedNotification(userId, invoiceNumber, amount, invoiceId);
exports.sendInvoiceGeneratedNotification = sendInvoiceGeneratedNotification;
const sendSystemAlertToAdmins = (alertType, message, priority) => notificationService.sendSystemAlertToAdmins(alertType, message, priority);
exports.sendSystemAlertToAdmins = sendSystemAlertToAdmins;
exports.default = notificationService;
//# sourceMappingURL=notificationService.js.map