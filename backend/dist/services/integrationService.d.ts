export declare class PaymentService {
    private razorpayKeyId;
    private razorpayKeySecret;
    private payuMerchantKey;
    private payuMerchantSalt;
    constructor();
    createRazorpayOrder(amount: number, currency: string | undefined, receipt: string): Promise<any>;
    verifyRazorpayPayment(paymentId: string, orderId: string, signature: string): Promise<boolean>;
    createPayUPayment(amount: number, txnId: string, productInfo: string, customerEmail: string): Promise<{
        key: string;
        txnid: string;
        amount: number;
        productinfo: string;
        firstname: string;
        email: string;
        phone: string;
        surl: string;
        furl: string;
        hash: string;
    }>;
}
export declare class EmailService {
    constructor();
    sendGmailEmail(to: string, subject: string, body: string, accessToken: string): Promise<any>;
    sendOutlookEmail(to: string, subject: string, body: string, accessToken: string): Promise<any>;
}
export declare class DocumentSigningService {
    private docusignAccountId;
    private docusignIntegrationKey;
    private docusignUserId;
    private docusignPrivateKey;
    constructor();
    createDocuSignEnvelope(documentBase64: string, signerEmail: string, signerName: string): Promise<any>;
    private getDocuSignToken;
    private generateDocuSignJWT;
}
export declare class SMSService {
    private twilioAccountSid;
    private twilioAuthToken;
    private twilioPhoneNumber;
    private textlocalApiKey;
    private textlocalSender;
    constructor();
    sendTwilioSMS(to: string, message: string): Promise<any>;
    sendTextLocalSMS(to: string, message: string): Promise<any>;
}
export declare class CalendarService {
    constructor();
    createGoogleCalendarEvent(accessToken: string, summary: string, description: string, startTime: string, endTime: string, attendees: string[]): Promise<any>;
    createOutlookCalendarEvent(accessToken: string, subject: string, body: string, startTime: string, endTime: string, attendees: string[]): Promise<any>;
}
export declare const paymentService: PaymentService;
export declare const emailService: EmailService;
export declare const documentSigningService: DocumentSigningService;
export declare const smsService: SMSService;
export declare const calendarService: CalendarService;
//# sourceMappingURL=integrationService.d.ts.map