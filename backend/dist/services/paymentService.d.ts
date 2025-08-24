export declare class PaymentService {
    createRazorpayOrder(orderData: {
        amount: number;
        currency: string;
        receipt: string;
        notes?: Record<string, string>;
    }): Promise<any>;
    verifyRazorpayPayment(paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<any>;
    createPayUOrder(orderData: {
        amount: number;
        currency: string;
        txnid: string;
        productinfo: string;
        firstname: string;
        email: string;
        phone: string;
        surl: string;
        furl: string;
    }): Promise<any>;
    verifyPayUPayment(paymentData: {
        txnid: string;
        amount: string;
        productinfo: string;
        firstname: string;
        email: string;
        mihpayid: string;
        status: string;
        hash: string;
    }): Promise<any>;
    getPaymentStatus(paymentId: string, gateway: 'razorpay' | 'payu'): Promise<any>;
    refundPayment(paymentId: string, amount: number, reason: string, gateway: 'razorpay' | 'payu'): Promise<any>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=paymentService.d.ts.map