export declare enum NotificationType {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
    TASK_ASSIGNMENT = "task_assignment",
    CASE_UPDATE = "case_update",
    DOCUMENT_UPLOAD = "document_upload",
    INVOICE_GENERATED = "invoice_generated",
    PAYMENT_RECEIVED = "payment_received",
    SYSTEM_ALERT = "system_alert"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
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
declare class NotificationService {
    private db;
    constructor();
    createNotification(userId: string, type: NotificationType, priority: NotificationPriority, title: string, message: string, data?: Record<string, any>): Promise<string>;
    getUserNotifications(userId: string, limit?: number, offset?: number, unreadOnly?: boolean): Promise<Notification[]>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    sendTaskAssignmentNotification(userId: string, taskTitle: string, assignedBy: string, taskId: string): Promise<void>;
    sendCaseUpdateNotification(userId: string, caseNumber: string, updateType: string, caseId: string): Promise<void>;
    sendDocumentUploadNotification(userId: string, documentTitle: string, caseNumber: string, documentId: string): Promise<void>;
    sendInvoiceGeneratedNotification(userId: string, invoiceNumber: string, amount: number, invoiceId: string): Promise<void>;
    sendSystemAlertToAdmins(alertType: string, message: string, priority?: NotificationPriority): Promise<void>;
    private getUserEmail;
    private getAdminUsers;
}
declare const notificationService: NotificationService;
export declare const sendNotification: (userId: string, type: NotificationType, priority: NotificationPriority, title: string, message: string, data?: Record<string, any>) => Promise<string>;
export declare const sendTaskAssignmentNotification: (userId: string, taskTitle: string, assignedBy: string, taskId: string) => Promise<void>;
export declare const sendCaseUpdateNotification: (userId: string, caseNumber: string, updateType: string, caseId: string) => Promise<void>;
export declare const sendDocumentUploadNotification: (userId: string, documentTitle: string, caseNumber: string, documentId: string) => Promise<void>;
export declare const sendInvoiceGeneratedNotification: (userId: string, invoiceNumber: string, amount: number, invoiceId: string) => Promise<void>;
export declare const sendSystemAlertToAdmins: (alertType: string, message: string, priority?: NotificationPriority) => Promise<void>;
export default notificationService;
//# sourceMappingURL=notificationService.d.ts.map