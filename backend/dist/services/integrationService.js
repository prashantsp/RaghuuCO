"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarService = exports.smsService = exports.documentSigningService = exports.emailService = exports.paymentService = exports.CalendarService = exports.SMSService = exports.DocumentSigningService = exports.EmailService = exports.PaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("@/utils/logger"));
class PaymentService {
    constructor() {
        this.razorpayKeyId = process.env["RAZORPAY_KEY_ID"] || '';
        this.razorpayKeySecret = process.env["RAZORPAY_KEY_SECRET"] || '';
        this.payuMerchantKey = process.env.PAYU_MERCHANT_KEY || '';
        this.payuMerchantSalt = process.env["PAYU_MERCHANT_SALT"] || '';
    }
    async createRazorpayOrder(amount, currency = 'INR', receipt) {
        try {
            const response = await axios_1.default.post('https://api.razorpay.com/v1/orders', {
                amount: amount * 100,
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
            logger_1.default.info('Razorpay order created successfully', { receipt, amount });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error creating Razorpay order', error);
            throw new Error('Failed to create payment order');
        }
    }
    async verifyRazorpayPayment(paymentId, orderId, signature) {
        try {
            const text = `${orderId}|${paymentId}`;
            const generatedSignature = crypto_1.default
                .createHmac('sha256', this.razorpayKeySecret)
                .update(text)
                .digest('hex');
            const isValid = generatedSignature === signature;
            if (isValid) {
                logger_1.default.info('Razorpay payment verified successfully', { paymentId, orderId });
                return true;
            }
            else {
                logger_1.default.warn('Invalid Razorpay payment signature', { paymentId, orderId });
                return false;
            }
        }
        catch (error) {
            logger_1.default.error('Error verifying Razorpay payment', error);
            throw new Error('Failed to verify payment');
        }
    }
    async createPayUPayment(amount, txnId, productInfo, customerEmail) {
        try {
            const hashString = `${this.payuMerchantKey}|${txnId}|${amount}|${productInfo}|${customerEmail}|||||||||||${this.payuMerchantSalt}`;
            const hash = crypto_1.default.createHash('sha512').update(hashString).digest('hex');
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
            logger_1.default.info('PayU payment request created', { txnId, amount });
            return paymentData;
        }
        catch (error) {
            logger_1.default.error('Error creating PayU payment', error);
            throw new Error('Failed to create payment request');
        }
    }
}
exports.PaymentService = PaymentService;
class EmailService {
    constructor() {
    }
    async sendGmailEmail(to, subject, body, accessToken) {
        try {
            const message = {
                to,
                subject,
                body: {
                    contentType: 'HTML',
                    content: body
                }
            };
            const response = await axios_1.default.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { raw: Buffer.from(JSON.stringify(message)).toString('base64') }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            logger_1.default.info('Gmail email sent successfully', { to, subject });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error sending Gmail email', error);
            throw new Error('Failed to send email');
        }
    }
    async sendOutlookEmail(to, subject, body, accessToken) {
        try {
            const response = await axios_1.default.post('https://graph.microsoft.com/v1.0/me/sendMail', {
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
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            logger_1.default.info('Outlook email sent successfully', { to, subject });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error sending Outlook email', error);
            throw new Error('Failed to send email');
        }
    }
}
exports.EmailService = EmailService;
class DocumentSigningService {
    constructor() {
        this.docusignAccountId = process.env["DOCUSIGN_ACCOUNT_ID"] || '';
        this.docusignIntegrationKey = process.env["DOCUSIGN_INTEGRATION_KEY"] || '';
        this.docusignUserId = process.env["DOCUSIGN_USER_ID"] || '';
        this.docusignPrivateKey = process.env["DOCUSIGN_PRIVATE_KEY"] || '';
    }
    async createDocuSignEnvelope(documentBase64, signerEmail, signerName) {
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
            const response = await axios_1.default.post(`https://demo.docusign.net/restapi/v2.1/accounts/${this.docusignAccountId}/envelopes`, envelope, {
                headers: {
                    'Authorization': `Bearer ${await this.getDocuSignToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            logger_1.default.info('DocuSign envelope created successfully', { signerEmail });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error creating DocuSign envelope', error);
            throw new Error('Failed to create signing envelope');
        }
    }
    async getDocuSignToken() {
        try {
            const response = await axios_1.default.post('https://account-d.docusign.com/oauth/token', {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: this.generateDocuSignJWT()
            });
            return response.data.access_token;
        }
        catch (error) {
            logger_1.default.error('Error getting DocuSign token', error);
            throw new Error('Failed to get access token');
        }
    }
    generateDocuSignJWT() {
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
        const signature = crypto_1.default
            .createSign('RSA-SHA256')
            .update(`${encodedHeader}.${encodedPayload}`)
            .sign(this.docusignPrivateKey, 'base64');
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
}
exports.DocumentSigningService = DocumentSigningService;
class SMSService {
    constructor() {
        this.twilioAccountSid = process.env["TWILIO_ACCOUNT_SID"] || '';
        this.twilioAuthToken = process.env["TWILIO_AUTH_TOKEN"] || '';
        this.twilioPhoneNumber = process.env["TWILIO_PHONE_NUMBER"] || '';
        this.textlocalApiKey = process.env["TEXTLOCAL_API_KEY"] || '';
        this.textlocalSender = process.env["TEXTLOCAL_SENDER"] || '';
    }
    async sendTwilioSMS(to, message) {
        try {
            const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
                To: to,
                From: this.twilioPhoneNumber,
                Body: message
            }, {
                auth: {
                    username: this.twilioAccountSid,
                    password: this.twilioAuthToken
                }
            });
            logger_1.default.info('Twilio SMS sent successfully', { to });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error sending Twilio SMS', error);
            throw new Error('Failed to send SMS');
        }
    }
    async sendTextLocalSMS(to, message) {
        try {
            const response = await axios_1.default.get('https://api.textlocal.in/send/', {
                params: {
                    apikey: this.textlocalApiKey,
                    numbers: to,
                    message,
                    sender: this.textlocalSender
                }
            });
            logger_1.default.info('TextLocal SMS sent successfully', { to });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error sending TextLocal SMS', error);
            throw new Error('Failed to send SMS');
        }
    }
}
exports.SMSService = SMSService;
class CalendarService {
    constructor() {
    }
    async createGoogleCalendarEvent(accessToken, summary, description, startTime, endTime, attendees) {
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
            const response = await axios_1.default.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', event, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            logger_1.default.info('Google Calendar event created successfully', { summary });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error creating Google Calendar event', error);
            throw new Error('Failed to create calendar event');
        }
    }
    async createOutlookCalendarEvent(accessToken, subject, body, startTime, endTime, attendees) {
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
            const response = await axios_1.default.post('https://graph.microsoft.com/v1.0/me/events', event, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            logger_1.default.info('Outlook Calendar event created successfully', { subject });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Error creating Outlook Calendar event', error);
            throw new Error('Failed to create calendar event');
        }
    }
}
exports.CalendarService = CalendarService;
exports.paymentService = new PaymentService();
exports.emailService = new EmailService();
exports.documentSigningService = new DocumentSigningService();
exports.smsService = new SMSService();
exports.calendarService = new CalendarService();
//# sourceMappingURL=integrationService.js.map