/**
 * Integration Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for external system integrations including payment gateways, email services, and document signing
 */

import axios from 'axios';
import crypto from 'crypto';
import logger from '@/utils/logger';

/**
 * Payment Gateway Integration Service
 * Handles Razorpay and PayU integrations
 */
export class PaymentService {
  private razorpayKeyId: string;
  private razorpayKeySecret: string;
  private payuMerchantId: string;
  private payuMerchantKey: string;
  private payuMerchantSalt: string;

  constructor() {
    this.razorpayKeyId = process.env["RAZORPAY_KEY_ID"] || '';
    this.razorpayKeySecret = process.env["RAZORPAY_KEY_SECRET"] || '';
    this.payuMerchantId = process.env["PAYU_MERCHANT_ID"] || '';
    this.payuMerchantKey = process.env["PAYU_MERCHANT_KEY"] || '';
    this.payuMerchantSalt = process.env["PAYU_MERCHANT_SALT"] || '';
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(amount: number, currency: string = 'INR', receipt: string) {
    try {
      const response = await axios.post('https://api.razorpay.com/v1/orders', {
        amount: amount * 100, // Convert to paise
        currency,
        receipt,
        notes: {
          source: 'RAGHUU_CO_LEGAL_SYSTEM'
        }
      }, {
        auth: {
          username: this.razorpayKeyId,
          password: this.razorpayKeySecret
        }
      });

      logger.info('Razorpay order created successfully', { receipt, amount });
      return response.data;
    } catch (error) {
      logger.error('Error creating Razorpay order', error as Error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(paymentId: string, orderId: string, signature: string) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(text)
        .digest('hex');

      const isValid = generatedSignature === signature;

      if (isValid) {
        logger.info('Razorpay payment verified successfully', { paymentId, orderId });
        return true;
      } else {
        logger.warn('Invalid Razorpay payment signature', { paymentId, orderId });
        return false;
      }
    } catch (error) {
      logger.error('Error verifying Razorpay payment', error as Error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Create PayU payment request
   */
  async createPayUPayment(amount: number, txnId: string, productInfo: string, customerEmail: string) {
    try {
      const hashString = `${this.payuMerchantKey}|${txnId}|${amount}|${productInfo}|${customerEmail}|||||||||||${this.payuMerchantSalt}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      const paymentData = {
        key: this.payuMerchantKey,
        txnid: txnId,
        amount,
        productinfo: productInfo,
        firstname: 'Customer',
        email: customerEmail,
        phone: '',
        surl: `${process.env["BASE_URL"]}/api/v1/payments/success`,
        furl: `${process.env["BASE_URL"]}/api/v1/payments/failure`,
        hash
      };

      logger.info('PayU payment request created', { txnId, amount });
      return paymentData;
    } catch (error) {
      logger.error('Error creating PayU payment', error as Error);
      throw new Error('Failed to create payment request');
    }
  }
}

/**
 * Email Service Integration
 * Handles Gmail and Outlook integrations
 */
export class EmailService {
  private gmailClientId: string;
  private gmailClientSecret: string;
  private outlookClientId: string;
  private outlookClientSecret: string;

  constructor() {
    this.gmailClientId = process.env["GMAIL_CLIENT_ID"] || '';
    this.gmailClientSecret = process.env["GMAIL_CLIENT_SECRET"] || '';
    this.outlookClientId = process.env["OUTLOOK_CLIENT_ID"] || '';
    this.outlookClientSecret = process.env["OUTLOOK_CLIENT_SECRET"] || '';
  }

  /**
   * Send email via Gmail API
   */
  async sendGmailEmail(to: string, subject: string, body: string, accessToken: string) {
    try {
      const message = {
        to,
        subject,
        body: {
          contentType: 'HTML',
          content: body
        }
      };

      const response = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        { raw: Buffer.from(JSON.stringify(message)).toString('base64') },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Gmail email sent successfully', { to, subject });
      return response.data;
    } catch (error) {
      logger.error('Error sending Gmail email', error as Error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email via Outlook API
   */
  async sendOutlookEmail(to: string, subject: string, body: string, accessToken: string) {
    try {
      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject,
            body: {
              contentType: 'HTML',
              content: body
            },
            toRecipients: [
              {
                emailAddress: {
                  address: to
                }
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Outlook email sent successfully', { to, subject });
      return response.data;
    } catch (error) {
      logger.error('Error sending Outlook email', error as Error);
      throw new Error('Failed to send email');
    }
  }
}

/**
 * Document Signing Service
 * Handles DocuSign and eSign integrations
 */
export class DocumentSigningService {
  private docusignAccountId: string;
  private docusignIntegrationKey: string;
  private docusignUserId: string;
  private docusignPrivateKey: string;

  constructor() {
    this.docusignAccountId = process.env["DOCUSIGN_ACCOUNT_ID"] || '';
    this.docusignIntegrationKey = process.env["DOCUSIGN_INTEGRATION_KEY"] || '';
    this.docusignUserId = process.env["DOCUSIGN_USER_ID"] || '';
    this.docusignPrivateKey = process.env["DOCUSIGN_PRIVATE_KEY"] || '';
  }

  /**
   * Create DocuSign envelope
   */
  async createDocuSignEnvelope(documentBase64: string, signerEmail: string, signerName: string) {
    try {
      const envelope = {
        emailSubject: 'Please sign this document',
        documents: [
          {
            documentBase64,
            name: 'Document',
            fileExtension: 'pdf',
            documentId: '1'
          }
        ],
        recipients: {
          signers: [
            {
              email: signerEmail,
              name: signerName,
              recipientId: '1',
              routingOrder: '1'
            }
          ]
        },
        status: 'sent'
      };

      const response = await axios.post(
        `https://demo.docusign.net/restapi/v2.1/accounts/${this.docusignAccountId}/envelopes`,
        envelope,
        {
          headers: {
            'Authorization': `Bearer ${await this.getDocuSignToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('DocuSign envelope created successfully', { signerEmail });
      return response.data;
    } catch (error) {
      logger.error('Error creating DocuSign envelope', error as Error);
      throw new Error('Failed to create signing envelope');
    }
  }

  /**
   * Get DocuSign access token
   */
  private async getDocuSignToken(): Promise<string> {
    try {
      const response = await axios.post('https://account-d.docusign.com/oauth/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: this.generateDocuSignJWT()
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('Error getting DocuSign token', error as Error);
      throw new Error('Failed to get access token');
    }
  }

  /**
   * Generate DocuSign JWT
   */
  private generateDocuSignJWT(): string {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.docusignIntegrationKey,
      sub: this.docusignUserId,
      aud: 'account-d.docusign.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'signature'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(`${encodedHeader}.${encodedPayload}`)
      .sign(this.docusignPrivateKey, 'base64');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

/**
 * SMS Service Integration
 * Handles Twilio and TextLocal integrations
 */
export class SMSService {
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioPhoneNumber: string;
  private textlocalApiKey: string;
  private textlocalSender: string;

  constructor() {
    this.twilioAccountSid = process.env["TWILIO_ACCOUNT_SID"] || '';
    this.twilioAuthToken = process.env["TWILIO_AUTH_TOKEN"] || '';
    this.twilioPhoneNumber = process.env["TWILIO_PHONE_NUMBER"] || '';
    this.textlocalApiKey = process.env["TEXTLOCAL_API_KEY"] || '';
    this.textlocalSender = process.env["TEXTLOCAL_SENDER"] || '';
  }

  /**
   * Send SMS via Twilio
   */
  async sendTwilioSMS(to: string, message: string) {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          To: to,
          From: this.twilioPhoneNumber,
          Body: message
        },
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken
          }
        }
      );

      logger.info('Twilio SMS sent successfully', { to });
      return response.data;
    } catch (error) {
      logger.error('Error sending Twilio SMS', error as Error);
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Send SMS via TextLocal
   */
  async sendTextLocalSMS(to: string, message: string) {
    try {
      const response = await axios.get('https://api.textlocal.in/send/', {
        params: {
          apikey: this.textlocalApiKey,
          numbers: to,
          message,
          sender: this.textlocalSender
        }
      });

      logger.info('TextLocal SMS sent successfully', { to });
      return response.data;
    } catch (error) {
      logger.error('Error sending TextLocal SMS', error as Error);
      throw new Error('Failed to send SMS');
    }
  }
}

/**
 * Calendar Integration Service
 * Handles Google Calendar and Outlook Calendar integrations
 */
export class CalendarService {
  private googleClientId: string;
  private googleClientSecret: string;
  private outlookClientId: string;
  private outlookClientSecret: string;

  constructor() {
    this.googleClientId = process.env["GOOGLE_CLIENT_ID"] || '';
    this.googleClientSecret = process.env["GOOGLE_CLIENT_SECRET"] || '';
    this.outlookClientId = process.env["OUTLOOK_CLIENT_ID"] || '';
    this.outlookClientSecret = process.env["OUTLOOK_CLIENT_SECRET"] || '';
  }

  /**
   * Create Google Calendar event
   */
  async createGoogleCalendarEvent(
    accessToken: string,
    summary: string,
    description: string,
    startTime: string,
    endTime: string,
    attendees: string[]
  ) {
    try {
      const event = {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endTime,
          timeZone: 'Asia/Kolkata'
        },
        attendees: attendees.map(email => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        event,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Google Calendar event created successfully', { summary });
      return response.data;
    } catch (error) {
      logger.error('Error creating Google Calendar event', error as Error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Create Outlook Calendar event
   */
  async createOutlookCalendarEvent(
    accessToken: string,
    subject: string,
    body: string,
    startTime: string,
    endTime: string,
    attendees: string[]
  ) {
    try {
      const event = {
        subject,
        body: {
          contentType: 'HTML',
          content: body
        },
        start: {
          dateTime: startTime,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endTime,
          timeZone: 'Asia/Kolkata'
        },
        attendees: attendees.map(email => ({
          emailAddress: { address: email },
          type: 'required'
        }))
      };

      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/events',
        event,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Outlook Calendar event created successfully', { subject });
      return response.data;
    } catch (error) {
      logger.error('Error creating Outlook Calendar event', error as Error);
      throw new Error('Failed to create calendar event');
    }
  }
}

// Export service instances
export const paymentService = new PaymentService();
export const emailService = new EmailService();
export const documentSigningService = new DocumentSigningService();
export const smsService = new SMSService();
export const calendarService = new CalendarService();