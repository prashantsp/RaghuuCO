interface EmailContent {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}
declare class EmailService {
    private transporter;
    private isConfigured;
    constructor();
    private initializeTransporter;
    sendEmail(content: EmailContent): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, userName: string, tempPassword?: string): Promise<boolean>;
    sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean>;
    sendCaseUpdateNotification(userEmail: string, caseNumber: string, updateType: string): Promise<boolean>;
    sendInvoiceNotification(userEmail: string, invoiceNumber: string, amount: number): Promise<boolean>;
    sendTaskAssignmentNotification(userEmail: string, taskTitle: string, assignedBy: string): Promise<boolean>;
    sendSystemAlert(adminEmails: string[], alertType: string, message: string): Promise<boolean>;
}
declare const emailService: EmailService;
export declare const sendEmail: (content: EmailContent) => Promise<boolean>;
export declare const sendWelcomeEmail: (userEmail: string, userName: string, tempPassword?: string) => Promise<boolean>;
export declare const sendPasswordResetEmail: (userEmail: string, resetToken: string) => Promise<boolean>;
export declare const sendCaseUpdateNotification: (userEmail: string, caseNumber: string, updateType: string) => Promise<boolean>;
export declare const sendInvoiceNotification: (userEmail: string, invoiceNumber: string, amount: number) => Promise<boolean>;
export declare const sendTaskAssignmentNotification: (userEmail: string, taskTitle: string, assignedBy: string) => Promise<boolean>;
export declare const sendSystemAlert: (adminEmails: string[], alertType: string, message: string) => Promise<boolean>;
export default emailService;
//# sourceMappingURL=emailService.d.ts.map