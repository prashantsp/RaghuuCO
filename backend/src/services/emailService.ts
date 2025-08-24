/**
 * Email Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for email integrations including Gmail and Outlook
 */

import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import logger from '@/utils/logger';

/**
 * Email Service Class
 * Handles email integrations with Gmail and Outlook
 */
export class EmailService {
  private gmailTransporter: nodemailer.Transporter | null = null;
  private outlookTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporters();
  }

  /**
   * Initialize email transporters
   */
  private async initializeTransporters() {
    try {
      // Initialize Gmail transporter
              if (process.env["GMAIL_CLIENT_ID"] && process.env["GMAIL_CLIENT_SECRET"]) {
        const oauth2Client = new google.auth.OAuth2(
          process.env["GMAIL_CLIENT_ID"],
          process.env["GMAIL_CLIENT_SECRET"],
          process.env["GMAIL_REDIRECT_URI"]
        );

        oauth2Client.setCredentials({
          refresh_token: process.env["GMAIL_REFRESH_TOKEN"]
        });

        this.gmailTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env["GMAIL_USER"],
            clientId: process.env["GMAIL_CLIENT_ID"],
            clientSecret: process.env["GMAIL_CLIENT_SECRET"],
            refreshToken: process.env["GMAIL_REFRESH_TOKEN"],
            accessToken: await oauth2Client.getAccessToken()
          }
        });

        logger.info('Gmail transporter initialized successfully');
      }

      // Initialize Outlook transporter
      if (process.env["OUTLOOK_USER"] && process.env["OUTLOOK_PASSWORD"]) {
        this.outlookTransporter = nodemailer.createTransport({
          host: 'smtp-mail.outlook.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env["OUTLOOK_USER"],
            pass: process.env["OUTLOOK_PASSWORD"]
          }
        });

        logger.info('Outlook transporter initialized successfully');
      }
    } catch (error) {
      logger.error('Error initializing email transporters', error as Error);
    }
  }

  /**
   * Send email via Gmail
   */
  async sendGmailEmail(emailData: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }): Promise<any> {
    try {
      if (!this.gmailTransporter) {
        throw new Error('Gmail transporter not initialized');
      }

      logger.info('Sending Gmail email', { 
        to: emailData.to, 
        subject: emailData.subject 
      });

      const mailOptions = {
        from: process.env["GMAIL_USER"],
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      };

      const result = await this.gmailTransporter.sendMail(mailOptions);

      logger.info('Gmail email sent successfully', { 
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
    } catch (error) {
      logger.error('Error sending Gmail email', error as Error);
      throw new Error('Failed to send Gmail email');
    }
  }

  /**
   * Send email via Outlook
   */
  async sendOutlookEmail(emailData: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }): Promise<any> {
    try {
      if (!this.outlookTransporter) {
        throw new Error('Outlook transporter not initialized');
      }

      logger.info('Sending Outlook email', { 
        to: emailData.to, 
        subject: emailData.subject 
      });

      const mailOptions = {
        from: process.env["OUTLOOK_USER"],
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      };

      const result = await this.outlookTransporter.sendMail(mailOptions);

      logger.info('Outlook email sent successfully', { 
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
    } catch (error) {
      logger.error('Error sending Outlook email', error as Error);
      throw new Error('Failed to send Outlook email');
    }
  }

  /**
   * Send email with automatic provider selection
   */
  async sendEmail(emailData: {
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
  }): Promise<any> {
    try {
      const provider = emailData.provider || 'gmail';

      if (provider === 'gmail') {
        return await this.sendGmailEmail(emailData);
      } else if (provider === 'outlook') {
        return await this.sendOutlookEmail(emailData);
      } else {
        throw new Error('Invalid email provider');
      }
    } catch (error) {
      logger.error('Error sending email', error as Error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send template email
   */
  async sendTemplateEmail(templateData: {
    to: string | string[];
    template: string;
    variables: Record<string, any>;
    subject: string;
    provider?: 'gmail' | 'outlook';
  }): Promise<any> {
    try {
      logger.info('Sending template email', { 
        to: templateData.to, 
        template: templateData.template 
      });

      // Load email template
      const template = await this.loadEmailTemplate(templateData.template);
      
      // Replace variables in template
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
    } catch (error) {
      logger.error('Error sending template email', error as Error);
      throw new Error('Failed to send template email');
    }
  }

  /**
   * Load email template
   */
  private async loadEmailTemplate(templateName: string): Promise<{ html: string; text: string }> {
    try {
      // This would typically load from a database or file system
      // For now, we'll return a basic template
      const templates: Record<string, { html: string; text: string }> = {
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
    } catch (error) {
      logger.error('Error loading email template', error as Error);
      throw new Error('Failed to load email template');
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConfiguration(provider: 'gmail' | 'outlook'): Promise<any> {
    try {
      logger.info('Verifying email configuration', { provider });

      if (provider === 'gmail') {
        if (!this.gmailTransporter) {
          throw new Error('Gmail transporter not initialized');
        }
        await this.gmailTransporter.verify();
      } else if (provider === 'outlook') {
        if (!this.outlookTransporter) {
          throw new Error('Outlook transporter not initialized');
        }
        await this.outlookTransporter.verify();
      }

      logger.info('Email configuration verified successfully', { provider });

      return {
        success: true,
        data: {
          provider,
          verified: true
        }
      };
    } catch (error) {
      logger.error('Error verifying email configuration', error as Error);
      throw new Error('Failed to verify email configuration');
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStatistics(): Promise<any> {
    try {
      logger.info('Getting email statistics');

      // This would typically query a database for email statistics
      // For now, we'll return mock data
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
    } catch (error) {
      logger.error('Error getting email statistics', error as Error);
      throw new Error('Failed to get email statistics');
    }
  }
}

// Export service instance
export const emailService = new EmailService();