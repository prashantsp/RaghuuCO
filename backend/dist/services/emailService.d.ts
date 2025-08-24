export declare class EmailService {
    private gmailTransporter;
    private outlookTransporter;
    constructor();
    private initializeTransporters;
    sendGmailEmail(emailData: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        attachments?: Array<{
            filename: string;
            content: Buffer | string;
            contentType?: string;
        }>;
    }): Promise<any>;
    sendOutlookEmail(emailData: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        attachments?: Array<{
            filename: string;
            content: Buffer | string;
            contentType?: string;
        }>;
    }): Promise<any>;
    sendEmail(emailData: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        attachments?: Array<{
            filename: string;
            content: Buffer | string;
            contentType?: string;
        }>;
        provider?: 'gmail' | 'outlook';
    }): Promise<any>;
    sendTemplateEmail(templateData: {
        to: string | string[];
        template: string;
        variables: Record<string, any>;
        subject: string;
        provider?: 'gmail' | 'outlook';
    }): Promise<any>;
    private loadEmailTemplate;
    verifyConfiguration(provider: 'gmail' | 'outlook'): Promise<any>;
    getEmailStatistics(): Promise<any>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map