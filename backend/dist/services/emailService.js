"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const logger_1 = __importDefault(require("@/utils/logger"));
class EmailService {
    constructor() {
        this.gmailTransporter = null;
        this.outlookTransporter = null;
        this.initializeTransporters();
    }
    async initializeTransporters() {
        try {
            if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
                const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URI);
                oauth2Client.setCredentials({
                    refresh_token: process.env.GMAIL_REFRESH_TOKEN
                });
                this.gmailTransporter = nodemailer_1.default.createTransporter({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: process.env.GMAIL_USER,
                        clientId: process.env.GMAIL_CLIENT_ID,
                        clientSecret: process.env.GMAIL_CLIENT_SECRET,
                        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                        accessToken: await oauth2Client.getAccessToken()
                    }
                });
                logger_1.default.info('Gmail transporter initialized successfully');
            }
            if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
                this.outlookTransporter = nodemailer_1.default.createTransporter({
                    host: 'smtp-mail.outlook.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.OUTLOOK_USER,
                        pass: process.env.OUTLOOK_PASSWORD
                    }
                });
                logger_1.default.info('Outlook transporter initialized successfully');
            }
        }
        catch (error) {
            logger_1.default.error('Error initializing email transporters', error);
        }
    }
    async sendGmailEmail(emailData) {
        try {
            if (!this.gmailTransporter) {
                throw new Error('Gmail transporter not initialized');
            }
            logger_1.default.info('Sending Gmail email', {
                to: emailData.to,
                subject: emailData.subject
            });
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
                attachments: emailData.attachments
            };
            const result = await this.gmailTransporter.sendMail(mailOptions);
            logger_1.default.info('Gmail email sent successfully', {
                messageId: result.messageId,
                to: emailData.to
            });
            return {
                success: true,
                data: {
                    messageId: result.messageId,
                    accepted: result.accepted,
                    rejected: result.rejected
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error sending Gmail email', error);
            throw new Error('Failed to send Gmail email');
        }
    }
    async sendOutlookEmail(emailData) {
        try {
            if (!this.outlookTransporter) {
                throw new Error('Outlook transporter not initialized');
            }
            logger_1.default.info('Sending Outlook email', {
                to: emailData.to,
                subject: emailData.subject
            });
            const mailOptions = {
                from: process.env.OUTLOOK_USER,
                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
                attachments: emailData.attachments
            };
            const result = await this.outlookTransporter.sendMail(mailOptions);
            logger_1.default.info('Outlook email sent successfully', {
                messageId: result.messageId,
                to: emailData.to
            });
            return {
                success: true,
                data: {
                    messageId: result.messageId,
                    accepted: result.accepted,
                    rejected: result.rejected
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error sending Outlook email', error);
            throw new Error('Failed to send Outlook email');
        }
    }
    async sendEmail(emailData) {
        try {
            const provider = emailData.provider || 'gmail';
            if (provider === 'gmail') {
                return await this.sendGmailEmail(emailData);
            }
            else if (provider === 'outlook') {
                return await this.sendOutlookEmail(emailData);
            }
            else {
                throw new Error('Invalid email provider');
            }
        }
        catch (error) {
            logger_1.default.error('Error sending email', error);
            throw new Error('Failed to send email');
        }
    }
    async sendTemplateEmail(templateData) {
        try {
            logger_1.default.info('Sending template email', {
                to: templateData.to,
                template: templateData.template
            });
            const template = await this.loadEmailTemplate(templateData.template);
            let html = template.html;
            let text = template.text;
            Object.entries(templateData.variables).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, value);
                text = text.replace(regex, value);
            });
            return await this.sendEmail({
                to: templateData.to,
                subject: templateData.subject,
                html,
                text,
                provider: templateData.provider
            });
        }
        catch (error) {
            logger_1.default.error('Error sending template email', error);
            throw new Error('Failed to send template email');
        }
    }
    async loadEmailTemplate(templateName) {
        try {
            const templates = {
                'invoice': {
                    html: `
            <h2>Invoice</h2>
            <p>Dear {{clientName}},</p>
            <p>Your invoice for {{invoiceNumber}} has been generated.</p>
            <p>Amount: {{amount}}</p>
            <p>Due Date: {{dueDate}}</p>
            <p>Thank you for your business.</p>
          `,
                    text: `
            Invoice
            
            Dear {{clientName}},
            
            Your invoice for {{invoiceNumber}} has been generated.
            Amount: {{amount}}
            Due Date: {{dueDate}}
            
            Thank you for your business.
          `
                },
                'case_update': {
                    html: `
            <h2>Case Update</h2>
            <p>Dear {{clientName}},</p>
            <p>Your case {{caseNumber}} has been updated.</p>
            <p>Status: {{status}}</p>
            <p>Update: {{update}}</p>
            <p>Please contact us if you have any questions.</p>
          `,
                    text: `
            Case Update
            
            Dear {{clientName}},
            
            Your case {{caseNumber}} has been updated.
            Status: {{status}}
            Update: {{update}}
            
            Please contact us if you have any questions.
          `
                },
                'appointment_reminder': {
                    html: `
            <h2>Appointment Reminder</h2>
            <p>Dear {{clientName}},</p>
            <p>This is a reminder for your appointment on {{appointmentDate}} at {{appointmentTime}}.</p>
            <p>Location: {{location}}</p>
            <p>Please arrive 10 minutes early.</p>
          `,
                    text: `
            Appointment Reminder
            
            Dear {{clientName}},
            
            This is a reminder for your appointment on {{appointmentDate}} at {{appointmentTime}}.
            Location: {{location}}
            
            Please arrive 10 minutes early.
          `
                }
            };
            const template = templates[templateName];
            if (!template) {
                throw new Error(`Template '${templateName}' not found`);
            }
            return template;
        }
        catch (error) {
            logger_1.default.error('Error loading email template', error);
            throw new Error('Failed to load email template');
        }
    }
    async verifyConfiguration(provider) {
        try {
            logger_1.default.info('Verifying email configuration', { provider });
            if (provider === 'gmail') {
                if (!this.gmailTransporter) {
                    throw new Error('Gmail transporter not initialized');
                }
                await this.gmailTransporter.verify();
            }
            else if (provider === 'outlook') {
                if (!this.outlookTransporter) {
                    throw new Error('Outlook transporter not initialized');
                }
                await this.outlookTransporter.verify();
            }
            logger_1.default.info('Email configuration verified successfully', { provider });
            return {
                success: true,
                data: {
                    provider,
                    verified: true
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error verifying email configuration', error);
            throw new Error('Failed to verify email configuration');
        }
    }
    async getEmailStatistics() {
        try {
            logger_1.default.info('Getting email statistics');
            const stats = {
                totalSent: 1250,
                totalDelivered: 1200,
                totalBounced: 50,
                totalOpened: 800,
                totalClicked: 200,
                gmailSent: 750,
                outlookSent: 500
            };
            return {
                success: true,
                data: { stats }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting email statistics', error);
            throw new Error('Failed to get email statistics');
        }
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map