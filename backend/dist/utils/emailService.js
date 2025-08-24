"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSystemAlert = exports.sendTaskAssignmentNotification = exports.sendInvoiceNotification = exports.sendCaseUpdateNotification = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
class EmailService {
    constructor() {
        this.isConfigured = false;
        this.initializeTransporter();
    }
    initializeTransporter() {
        try {
            const config = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || ''
                }
            };
            if (!config.auth.user || !config.auth.pass) {
                logger_1.default.warn('Email service not configured - missing SMTP credentials');
                return;
            }
            this.transporter = nodemailer.createTransporter(config);
            this.isConfigured = true;
            logger_1.default.info('Email service initialized successfully');
        }
        catch (error) {
            logger_1.default.error('Failed to initialize email service:', error);
            this.isConfigured = false;
        }
    }
    async sendEmail(content) {
        if (!this.isConfigured) {
            logger_1.default.warn('Email service not configured, skipping email send');
            return false;
        }
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: Array.isArray(content.to) ? content.to.join(', ') : content.to,
                subject: content.subject,
                html: content.html,
                text: content.text,
                attachments: content.attachments
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger_1.default.info('Email sent successfully', { messageId: result.messageId });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(userEmail, userName, tempPassword) {
        const subject = 'Welcome to RAGHUU CO Legal Practice Management System';
        const html = `
      <h2>Welcome to RAGHUU CO!</h2>
      <p>Dear ${userName},</p>
      <p>Welcome to the RAGHUU CO Legal Practice Management System. Your account has been created successfully.</p>
      ${tempPassword ? `<p>Your temporary password is: <strong>${tempPassword}</strong></p>` : ''}
      <p>Please log in and change your password for security.</p>
      <p>Best regards,<br>RAGHUU CO Team</p>
    `;
        return this.sendEmail({
            to: userEmail,
            subject,
            html
        });
    }
    async sendPasswordResetEmail(userEmail, resetToken) {
        const subject = 'Password Reset Request - RAGHUU CO';
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const html = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password for the RAGHUU CO Legal Practice Management System.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>RAGHUU CO Team</p>
    `;
        return this.sendEmail({
            to: userEmail,
            subject,
            html
        });
    }
    async sendCaseUpdateNotification(userEmail, caseNumber, updateType) {
        const subject = `Case Update - ${caseNumber}`;
        const html = `
      <h2>Case Update Notification</h2>
      <p>Your case ${caseNumber} has been updated.</p>
      <p>Update Type: ${updateType}</p>
      <p>Please log in to view the details.</p>
      <p>Best regards,<br>RAGHUU CO Team</p>
    `;
        return this.sendEmail({
            to: userEmail,
            subject,
            html
        });
    }
    async sendInvoiceNotification(userEmail, invoiceNumber, amount) {
        const subject = `Invoice Generated - ${invoiceNumber}`;
        const html = `
      <h2>Invoice Generated</h2>
      <p>Your invoice ${invoiceNumber} has been generated.</p>
      <p>Amount: ₹${amount.toLocaleString()}</p>
      <p>Please log in to view and download the invoice.</p>
      <p>Best regards,<br>RAGHUU CO Team</p>
    `;
        return this.sendEmail({
            to: userEmail,
            subject,
            html
        });
    }
    async sendTaskAssignmentNotification(userEmail, taskTitle, assignedBy) {
        const subject = 'New Task Assigned';
        const html = `
      <h2>New Task Assignment</h2>
      <p>You have been assigned a new task: <strong>${taskTitle}</strong></p>
      <p>Assigned by: ${assignedBy}</p>
      <p>Please log in to view the task details.</p>
      <p>Best regards,<br>RAGHUU CO Team</p>
    `;
        return this.sendEmail({
            to: userEmail,
            subject,
            html
        });
    }
    async sendSystemAlert(adminEmails, alertType, message) {
        const subject = `System Alert - ${alertType}`;
        const html = `
      <h2>System Alert</h2>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Please check the system immediately.</p>
      <p>Best regards,<br>RAGHUU CO System</p>
    `;
        return this.sendEmail({
            to: adminEmails,
            subject,
            html
        });
    }
}
const emailService = new EmailService();
const sendEmail = (content) => emailService.sendEmail(content);
exports.sendEmail = sendEmail;
const sendWelcomeEmail = (userEmail, userName, tempPassword) => emailService.sendWelcomeEmail(userEmail, userName, tempPassword);
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (userEmail, resetToken) => emailService.sendPasswordResetEmail(userEmail, resetToken);
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendCaseUpdateNotification = (userEmail, caseNumber, updateType) => emailService.sendCaseUpdateNotification(userEmail, caseNumber, updateType);
exports.sendCaseUpdateNotification = sendCaseUpdateNotification;
const sendInvoiceNotification = (userEmail, invoiceNumber, amount) => emailService.sendInvoiceNotification(userEmail, invoiceNumber, amount);
exports.sendInvoiceNotification = sendInvoiceNotification;
const sendTaskAssignmentNotification = (userEmail, taskTitle, assignedBy) => emailService.sendTaskAssignmentNotification(userEmail, taskTitle, assignedBy);
exports.sendTaskAssignmentNotification = sendTaskAssignmentNotification;
const sendSystemAlert = (adminEmails, alertType, message) => emailService.sendSystemAlert(adminEmails, alertType, message);
exports.sendSystemAlert = sendSystemAlert;
exports.default = emailService;
//# sourceMappingURL=emailService.js.map