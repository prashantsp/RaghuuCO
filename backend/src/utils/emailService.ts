/**
 * Email Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Email service for sending notifications, alerts, and communications
 */

import * as nodemailer from 'nodemailer';
import logger from './logger';

/**
 * Email configuration interface
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Email content interface
 */
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

/**
 * Email service class
 */
class EmailService {
  private transporter!: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    try {
      const config: EmailConfig = {
        host: (process as any).env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt((process as any).env.SMTP_PORT || '587'),
        secure: (process as any).env.SMTP_SECURE === 'true',
        auth: {
          user: (process as any).env.SMTP_USER || '',
          pass: (process as any).env.SMTP_PASS || ''
        }
      };

      if (!config.auth.user || !config.auth.pass) {
        logger.warn('Email service not configured - missing SMTP credentials');
        return;
      }

      this.transporter = nodemailer.createTransport(config);
      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error as Error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(content: EmailContent): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: (process as any).env.SMTP_USER,
        to: Array.isArray(content.to) ? content.to.join(', ') : content.to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        attachments: content.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error as Error);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userEmail: string, userName: string, tempPassword?: string): Promise<boolean> {
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

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const subject = 'Password Reset Request - RAGHUU CO';
    const resetUrl = `${(process as any).env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
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

  /**
   * Send case update notification
   */
  async sendCaseUpdateNotification(userEmail: string, caseNumber: string, updateType: string): Promise<boolean> {
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

  /**
   * Send invoice notification
   */
  async sendInvoiceNotification(userEmail: string, invoiceNumber: string, amount: number): Promise<boolean> {
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

  /**
   * Send task assignment notification
   */
  async sendTaskAssignmentNotification(userEmail: string, taskTitle: string, assignedBy: string): Promise<boolean> {
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

  /**
   * Send system alert
   */
  async sendSystemAlert(adminEmails: string[], alertType: string, message: string): Promise<boolean> {
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

// Create singleton instance
const emailService = new EmailService();

// Export functions for backward compatibility
export const sendEmail = (content: EmailContent) => emailService.sendEmail(content);
export const sendWelcomeEmail = (userEmail: string, userName: string, tempPassword?: string) => 
  emailService.sendWelcomeEmail(userEmail, userName, tempPassword);
export const sendPasswordResetEmail = (userEmail: string, resetToken: string) => 
  emailService.sendPasswordResetEmail(userEmail, resetToken);
export const sendCaseUpdateNotification = (userEmail: string, caseNumber: string, updateType: string) => 
  emailService.sendCaseUpdateNotification(userEmail, caseNumber, updateType);
export const sendInvoiceNotification = (userEmail: string, invoiceNumber: string, amount: number) => 
  emailService.sendInvoiceNotification(userEmail, invoiceNumber, amount);
export const sendTaskAssignmentNotification = (userEmail: string, taskTitle: string, assignedBy: string) => 
  emailService.sendTaskAssignmentNotification(userEmail, taskTitle, assignedBy);
export const sendSystemAlert = (adminEmails: string[], alertType: string, message: string) => 
  emailService.sendSystemAlert(adminEmails, alertType, message);

export default emailService;