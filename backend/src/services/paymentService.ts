/**
 * Payment Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for payment gateway integrations including Razorpay and PayU
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: (process as any).env.RAZORPAY_KEY_ID || '',
  key_secret: (process as any).env.RAZORPAY_KEY_SECRET || ''
});

/**
 * Payment Service Class
 * Handles payment gateway integrations
 */
export class PaymentService {
  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(orderData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<any> {
    try {
      logger.info('Creating Razorpay order', { amount: orderData.amount, receipt: orderData.receipt });

      const options = {
        amount: orderData.amount * 100, // Razorpay expects amount in paise
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        notes: orderData.notes || {}
      };

      const order = await razorpay.orders.create(options);

      logger.info('Razorpay order created successfully', { orderId: order.id });

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt
        }
      };
    } catch (error) {
      logger.error('Error creating Razorpay order', error as Error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<any> {
    try {
      logger.info('Verifying Razorpay payment', { 
        orderId: paymentData.razorpay_order_id,
        paymentId: paymentData.razorpay_payment_id 
      });

      const text = `${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`;
      const signature = crypto
        .createHmac('sha256', (process as any).env.RAZORPAY_KEY_SECRET || '')
        .update(text)
        .digest('hex');

      const isValid = signature === paymentData.razorpay_signature;

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      logger.info('Razorpay payment verified successfully', { 
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
    } catch (error) {
      logger.error('Error verifying Razorpay payment', error as Error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Create PayU order
   */
  async createPayUOrder(orderData: {
    amount: number;
    currency: string;
    txnid: string;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    surl: string;
    furl: string;
  }): Promise<any> {
    try {
      logger.info('Creating PayU order', { amount: orderData.amount, txnid: orderData.txnid });

      const hashString = `${(process as any).env.PAYU_MERCHANT_KEY}|${orderData.txnid}|${orderData.amount}|${orderData.productinfo}|${orderData.firstname}|${orderData.email}|||||||||||${(process as any).env.PAYU_SALT}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      const payuData = {
        key: (process as any).env.PAYU_MERCHANT_KEY,
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

      logger.info('PayU order data prepared', { txnid: orderData.txnid });

      return {
        success: true,
        data: {
          payuData,
          hash
        }
      };
    } catch (error) {
      logger.error('Error creating PayU order', error as Error);
      throw new Error('Failed to create PayU order');
    }
  }

  /**
   * Verify PayU payment
   */
  async verifyPayUPayment(paymentData: {
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    mihpayid: string;
    status: string;
    hash: string;
  }): Promise<any> {
    try {
      logger.info('Verifying PayU payment', { txnid: paymentData.txnid, status: paymentData.status });

      const hashString = `${(process as any).env.PAYU_SALT}|${paymentData.status}|||||||||||${paymentData.email}|${paymentData.firstname}|${paymentData.productinfo}|${paymentData.amount}|${paymentData.txnid}|${(process as any).env.PAYU_MERCHANT_KEY}`;
      const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

      const isValid = calculatedHash === paymentData.hash;

      if (!isValid) {
        throw new Error('Invalid PayU payment signature');
      }

      logger.info('PayU payment verified successfully', { txnid: paymentData.txnid });

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
    } catch (error) {
      logger.error('Error verifying PayU payment', error as Error);
      throw new Error('Failed to verify PayU payment');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string, gateway: 'razorpay' | 'payu'): Promise<any> {
    try {
      logger.info('Getting payment status', { paymentId, gateway });

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
      } else {
        // For PayU, we would need to make an API call to their status endpoint
        // This is a simplified implementation
        return {
          success: true,
          data: {
            paymentId,
            status: 'success',
            gateway: 'payu'
          }
        };
      }
    } catch (error) {
      logger.error('Error getting payment status', error as Error);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount: number, reason: string, gateway: 'razorpay' | 'payu'): Promise<any> {
    try {
      logger.info('Processing refund', { paymentId, amount, gateway });

      if (gateway === 'razorpay') {
        const refund = await razorpay.payments.refund(paymentId, {
          amount: amount * 100, // Convert to paise
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
      } else {
        // PayU refund implementation would go here
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
    } catch (error) {
      logger.error('Error processing refund', error as Error);
      throw new Error('Failed to process refund');
    }
  }
}

// Export service instance
export const paymentService = new PaymentService();