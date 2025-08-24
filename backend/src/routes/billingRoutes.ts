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
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import billingController from '@/controllers/billingController';

const router = Router();

/**
 * @route GET /api/v1/billing/invoices
 * @desc Get all invoices with filtering and pagination
 * @access Private
 */
router.get('/invoices', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_INVOICES), 
  billingController.getInvoices
);

/**
 * @route GET /api/v1/billing/invoices/stats
 * @desc Get invoice statistics
 * @access Private
 */
router.get('/invoices/stats', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_INVOICES), 
  billingController.getInvoiceStats
);

/**
 * @route GET /api/v1/billing/invoices/:id
 * @desc Get invoice by ID
 * @access Private
 */
router.get('/invoices/:id', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_INVOICES), 
  billingController.getInvoiceById
);

/**
 * @route POST /api/v1/billing/invoices
 * @desc Create new invoice
 * @access Private
 */
router.post('/invoices', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_INVOICES), 
  billingController.createInvoice
);

/**
 * @route PUT /api/v1/billing/invoices/:id
 * @desc Update invoice
 * @access Private
 */
router.put('/invoices/:id', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_INVOICES), 
  billingController.updateInvoice
);

/**
 * @route DELETE /api/v1/billing/invoices/:id
 * @desc Delete invoice
 * @access Private
 */
router.delete('/invoices/:id', 
  authenticateToken, 
  authorizePermission(Permission.DELETE_INVOICES), 
  billingController.deleteInvoice
);

/**
 * @route GET /api/v1/billing/rates
 * @desc Get billing rates
 * @access Private
 */
router.get('/rates', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_BILLING_RATES), 
  billingController.getBillingRates
);

/**
 * @route POST /api/v1/billing/rates
 * @desc Create billing rate
 * @access Private
 */
router.post('/rates', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_BILLING_RATES), 
  billingController.createBillingRate
);

export default router;