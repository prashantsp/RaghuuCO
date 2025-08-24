/**
 * Billing Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for billing functionality including invoices, payments, and billing rates
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getBillingRates,
  createBillingRate
} from '@/controllers/billingController';

const router = Router();

/**
 * @route GET /api/v1/billing/invoices
 * @desc Get all invoices with filtering and pagination
 * @access Private
 */
router.get('/invoices', 
  authenticateToken, 
  getInvoices
);

/**
 * @route GET /api/v1/billing/invoices/stats
 * @desc Get invoice statistics
 * @access Private
 */
router.get('/invoices/stats', 
  authenticateToken, 
  getInvoiceStats
);

/**
 * @route GET /api/v1/billing/invoices/:id
 * @desc Get invoice by ID
 * @access Private
 */
router.get('/invoices/:id', 
  authenticateToken, 
  getInvoiceById
);

/**
 * @route POST /api/v1/billing/invoices
 * @desc Create new invoice
 * @access Private
 */
router.post('/invoices', 
  authenticateToken, 
  createInvoice
);

/**
 * @route PUT /api/v1/billing/invoices/:id
 * @desc Update invoice
 * @access Private
 */
router.put('/invoices/:id', 
  authenticateToken, 
  updateInvoice
);

/**
 * @route DELETE /api/v1/billing/invoices/:id
 * @desc Delete invoice
 * @access Private
 */
router.delete('/invoices/:id', 
  authenticateToken, 
  deleteInvoice
);

/**
 * @route GET /api/v1/billing/rates
 * @desc Get billing rates
 * @access Private
 */
router.get('/rates', 
  authenticateToken, 
  getBillingRates
);

/**
 * @route POST /api/v1/billing/rates
 * @desc Create billing rate
 * @access Private
 */
router.post('/rates', 
  authenticateToken, 
  createBillingRate
);

export default router;