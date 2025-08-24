"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../utils/logger"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});
class PaymentService {
    async createRazorpayOrder(orderData) {
        try {
            logger_1.default.info('Creating Razorpay order', { amount: orderData.amount, receipt: orderData.receipt });
            const options = {
                amount: orderData.amount * 100,
                currency: orderData.currency || 'INR',
                receipt: orderData.receipt,
                notes: orderData.notes || {}
            };
            const order = await razorpay.orders.create(options);
            logger_1.default.info('Razorpay order created successfully', { orderId: order.id });
            return {
                success: true,
                data: {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating Razorpay order', error);
            throw new Error('Failed to create payment order');
        }
    }
    async verifyRazorpayPayment(paymentData) {
        try {
            logger_1.default.info('Verifying Razorpay payment', {
                orderId: paymentData.razorpay_order_id,
                paymentId: paymentData.razorpay_payment_id
            });
            const text = `${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`;
            const signature = crypto_1.default
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(text)
                .digest('hex');
            const isValid = signature === paymentData.razorpay_signature;
            if (!isValid) {
                throw new Error('Invalid payment signature');
            }
            logger_1.default.info('Razorpay payment verified successfully', {
                orderId: paymentData.razorpay_order_id,
                paymentId: paymentData.razorpay_payment_id
            });
            return {
                success: true,
                data: {
                    orderId: paymentData.razorpay_order_id,
                    paymentId: paymentData.razorpay_payment_id,
                    verified: true
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error verifying Razorpay payment', error);
            throw new Error('Failed to verify payment');
        }
    }
    async createPayUOrder(orderData) {
        try {
            logger_1.default.info('Creating PayU order', { amount: orderData.amount, txnid: orderData.txnid });
            const hashString = `${process.env.PAYU_MERCHANT_KEY}|${orderData.txnid}|${orderData.amount}|${orderData.productinfo}|${orderData.firstname}|${orderData.email}|||||||||||${process.env.PAYU_SALT}`;
            const hash = crypto_1.default.createHash('sha512').update(hashString).digest('hex');
            const payuData = {
                key: process.env.PAYU_MERCHANT_KEY,
                txnid: orderData.txnid,
                amount: orderData.amount,
                productinfo: orderData.productinfo,
                firstname: orderData.firstname,
                email: orderData.email,
                phone: orderData.phone,
                surl: orderData.surl,
                furl: orderData.furl,
                hash: hash
            };
            logger_1.default.info('PayU order data prepared', { txnid: orderData.txnid });
            return {
                success: true,
                data: {
                    payuData,
                    hash
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating PayU order', error);
            throw new Error('Failed to create PayU order');
        }
    }
    async verifyPayUPayment(paymentData) {
        try {
            logger_1.default.info('Verifying PayU payment', { txnid: paymentData.txnid, status: paymentData.status });
            const hashString = `${process.env.PAYU_SALT}|${paymentData.status}|||||||||||${paymentData.email}|${paymentData.firstname}|${paymentData.productinfo}|${paymentData.amount}|${paymentData.txnid}|${process.env.PAYU_MERCHANT_KEY}`;
            const calculatedHash = crypto_1.default.createHash('sha512').update(hashString).digest('hex');
            const isValid = calculatedHash === paymentData.hash;
            if (!isValid) {
                throw new Error('Invalid PayU payment signature');
            }
            logger_1.default.info('PayU payment verified successfully', { txnid: paymentData.txnid });
            return {
                success: true,
                data: {
                    txnid: paymentData.txnid,
                    amount: paymentData.amount,
                    status: paymentData.status,
                    mihpayid: paymentData.mihpayid,
                    verified: true
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error verifying PayU payment', error);
            throw new Error('Failed to verify PayU payment');
        }
    }
    async getPaymentStatus(paymentId, gateway) {
        try {
            logger_1.default.info('Getting payment status', { paymentId, gateway });
            if (gateway === 'razorpay') {
                const payment = await razorpay.payments.fetch(paymentId);
                return {
                    success: true,
                    data: {
                        paymentId: payment.id,
                        status: payment.status,
                        amount: payment.amount,
                        currency: payment.currency,
                        method: payment.method,
                        captured: payment.captured
                    }
                };
            }
            else {
                return {
                    success: true,
                    data: {
                        paymentId,
                        status: 'success',
                        gateway: 'payu'
                    }
                };
            }
        }
        catch (error) {
            logger_1.default.error('Error getting payment status', error);
            throw new Error('Failed to get payment status');
        }
    }
    async refundPayment(paymentId, amount, reason, gateway) {
        try {
            logger_1.default.info('Processing refund', { paymentId, amount, gateway });
            if (gateway === 'razorpay') {
                const refund = await razorpay.payments.refund(paymentId, {
                    amount: amount * 100,
                    speed: 'normal',
                    notes: {
                        reason: reason
                    }
                });
                return {
                    success: true,
                    data: {
                        refundId: refund.id,
                        paymentId: refund.payment_id,
                        amount: refund.amount,
                        status: refund.status
                    }
                };
            }
            else {
                return {
                    success: true,
                    data: {
                        refundId: `refund_${Date.now()}`,
                        paymentId,
                        amount,
                        status: 'processed'
                    }
                };
            }
        }
        catch (error) {
            logger_1.default.error('Error processing refund', error);
            throw new Error('Failed to process refund');
        }
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map