/**
 * Billing Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for billing management including invoices, payments, and billing rates
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';
import { taxService } from '@/services/taxService';
import { SQLQueries } from '@/utils/db_SQLQueries';

const db = new DatabaseService();

/**
 * Get all invoices with filtering and pagination
 * 
 * @route GET /api/v1/billing/invoices
 * @access Private
 */
export const getInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, search, status, clientId, userId: filterUserId } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching invoices', { userId, filters: req.query });

    const result = await db.query(SQLQueries.INVOICES.SEARCH, [
      search || null,
      status || null,
      clientId || null,
      filterUserId || null,
      parseInt(limit as string),
      offset
    ]);

    const invoices = result;

    // Get total count for pagination
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM invoices i
      JOIN cases c ON i.case_id = c.id
      JOIN clients cl ON i.client_id = cl.id
      JOIN users u ON i.user_id = u.id
      WHERE ($1::text IS NULL OR i.invoice_number ILIKE $1 OR c.case_number ILIKE $1)
      AND ($2::invoice_status_enum IS NULL OR i.status = $2)
      AND ($3::uuid IS NULL OR i.client_id = $3)
      AND ($4::uuid IS NULL OR i.user_id = $4)
    `, [search || null, status || null, clientId || null, filterUserId || null]);

    const total = parseInt(countResult[0]?.total || '0');
    const totalPages = Math.ceil(total / parseInt(limit as string));

    logger.info('Invoices fetched successfully', { userId, count: invoices.length });

    return res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching invoices', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INVOICES_FETCH_ERROR',
        message: 'Failed to fetch invoices'
      }
    });
  }
};

/**
 * Get invoice by ID
 * 
 * @route GET /api/v1/billing/invoices/:id
 * @access Private
 */
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Fetching invoice by ID', { userId, invoiceId: id });

    const result = await db.query(SQLQueries.INVOICES.GET_BY_ID, [id]);
    const invoice = result[0];

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found'
        }
      });
    }

    // Get invoice items
    const itemsResult = await db.query(SQLQueries.INVOICE_ITEMS.GET_BY_INVOICE_ID, [id]);
    const items = itemsResult;

    // Get payments
    const paymentsResult = await db.query(SQLQueries.PAYMENTS.GET_BY_INVOICE_ID, [id]);
    const payments = paymentsResult;

    logger.info('Invoice fetched successfully', { userId, invoiceId: id });

    return res.json({
      success: true,
      data: {
        invoice: {
          ...invoice,
          items,
          payments
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching invoice', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INVOICE_FETCH_ERROR',
        message: 'Failed to fetch invoice'
      }
    });
  }
};

/**
 * Create new invoice
 * 
 * @route POST /api/v1/billing/invoices
 * @access Private
 */
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      caseId,
      clientId,
      userId: invoiceUserId,
      dueDate,
      notes,
      termsConditions,
      items
    } = req.body;

    logger.info('Creating new invoice', { userId, caseId, clientId });

    // Generate invoice number
    const numberResult = await db.query(SQLQueries.INVOICES.GENERATE_INVOICE_NUMBER);
    const invoiceNumber = numberResult[0]?.next_number || `INV-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    if (items && Array.isArray(items)) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    }

    // Get client information for tax calculation using centralized query
    const clientResult = await db.query(SQLQueries.CLIENTS.GET_CLIENT_TYPE, [clientId]);
    const clientType = clientResult[0]?.client_type || 'individual';
    
    // Calculate tax using tax service
    const taxCalculation = taxService.calculateInvoiceTax({
      subtotal,
      isInterState: false, // Default to intra-state, can be made configurable
      isTDSApplicable: clientType === 'company',
      clientType: clientType as 'individual' | 'company'
    });
    
    const taxAmount = taxCalculation.totalTax;
    const totalAmount = taxCalculation.grandTotal;

    // Create invoice
    const invoiceResult = await db.query(SQLQueries.INVOICES.CREATE, [
      invoiceNumber,
      caseId,
      clientId,
      invoiceUserId,
      'draft',
      subtotal,
      taxAmount,
      totalAmount,
      'INR',
      dueDate,
      new Date(),
      notes,
      termsConditions,
      userId
    ]);

    const invoice = invoiceResult[0];

    // Create invoice items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await db.query(SQLQueries.INVOICE_ITEMS.CREATE, [
          invoice.id,
          item.timeEntryId || null,
          item.description,
          item.quantity,
          item.unitRate,
          item.amount,
          item.itemType || 'time'
        ]);
      }
    }

    logger.businessEvent('invoice_created', 'invoice', invoice.id || '', userId || '');

    return res.status(201).json({
      success: true,
      data: { invoice }
    });
  } catch (error) {
    logger.error('Error creating invoice', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INVOICE_CREATE_ERROR',
        message: 'Failed to create invoice'
      }
    });
  }
};

/**
 * Update invoice
 * 
 * @route PUT /api/v1/billing/invoices/:id
 * @access Private
 */
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      status,
      dueDate,
      issuedDate,
      paidDate,
      paymentMethod,
      notes,
      termsConditions,
      items
    } = req.body;

    logger.info('Updating invoice', { userId, invoiceId: id });

    // Get current invoice
    const currentResult = await db.query(SQLQueries.INVOICES.GET_BY_ID, [id]);
    const currentInvoice = currentResult[0];

    if (!currentInvoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found'
        }
      });
    }

    // Calculate new totals if items are provided
    let subtotal = currentInvoice.subtotal;
    let totalAmount = currentInvoice.total_amount;
    
    if (items && Array.isArray(items)) {
      // Delete existing items
      await db.query(SQLQueries.INVOICE_ITEMS.DELETE_BY_INVOICE_ID, [id]);
      
      // Create new items
      subtotal = 0;
      for (const item of items) {
        await db.query(SQLQueries.INVOICE_ITEMS.CREATE, [
          id,
          item.timeEntryId || null,
          item.description,
          item.quantity,
          item.unitRate,
          item.amount,
          item.itemType || 'time'
        ]);
        subtotal += item.amount;
      }
      
      // Get client information for tax calculation using centralized query
      const clientResult = await db.query(SQLQueries.CLIENTS.GET_CLIENT_TYPE, [currentInvoice.client_id]);
      const clientType = clientResult[0]?.client_type || 'individual';
      
      // Calculate tax using tax service
      const taxCalculation = taxService.calculateInvoiceTax({
        subtotal,
        isInterState: false, // Default to intra-state, can be made configurable
        isTDSApplicable: clientType === 'company',
        clientType: clientType as 'individual' | 'company'
      });
      
      totalAmount = taxCalculation.grandTotal;
    }

    // Update invoice
    const result = await db.query(SQLQueries.INVOICES.UPDATE, [
      id,
      status || currentInvoice.status,
      subtotal,
      currentInvoice.tax_amount,
      totalAmount,
      dueDate || currentInvoice.due_date,
      issuedDate || currentInvoice.issued_date,
      paidDate || currentInvoice.paid_date,
      paymentMethod || currentInvoice.payment_method,
      notes || currentInvoice.notes,
      termsConditions || currentInvoice.terms_conditions
    ]);

    const updatedInvoice = result[0];

    logger.businessEvent('invoice_updated', 'invoice', id || '', userId || '');

    return res.json({
      success: true,
      data: { invoice: updatedInvoice }
    });
  } catch (error) {
    logger.error('Error updating invoice', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INVOICE_UPDATE_ERROR',
        message: 'Failed to update invoice'
      }
    });
  }
};

/**
 * Delete invoice
 * 
 * @route DELETE /api/v1/billing/invoices/:id
 * @access Private
 */
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Deleting invoice', { userId, invoiceId: id });

    // Check if invoice exists
    const currentResult = await db.query(SQLQueries.INVOICES.GET_BY_ID, [id]);
    const invoice = currentResult[0];

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found'
        }
      });
    }

    // Check if invoice can be deleted (only draft invoices)
    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVOICE_DELETE_ERROR',
          message: 'Only draft invoices can be deleted'
        }
      });
    }

    // Delete invoice (cascade will delete items)
    await db.query(SQLQueries.INVOICES.DELETE, [id]);

    logger.businessEvent('invoice_deleted', 'invoice', id || '', userId || '');

    return res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting invoice', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INVOICE_DELETE_ERROR',
        message: 'Failed to delete invoice'
      }
    });
  }
};

/**
 * Get invoice statistics
 * 
 * @route GET /api/v1/billing/invoices/stats
 * @access Private
 */
export const getInvoiceStats = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { clientId } = req.query;

    logger.info('Fetching invoice statistics', { userId, clientId });

    const result = await db.query(SQLQueries.INVOICES.GET_STATS, [userId, (clientId as string) || null]);
    const stats = result[0];

    logger.info('Invoice statistics fetched successfully', { userId, stats });

    return res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Error fetching invoice statistics', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INVOICE_STATS_ERROR',
        message: 'Failed to fetch invoice statistics'
      }
    });
  }
};

/**
 * Get billing rates for a user
 * 
 * @route GET /api/v1/billing/rates
 * @access Private
 */
export const getBillingRates = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { search, caseType, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching billing rates', { userId, filters: req.query });

    const result = await db.query(SQLQueries.BILLING_RATES.SEARCH, [
      search || null,
      caseType || null,
      parseInt(limit as string),
      offset
    ]);

    const rates = result;

    logger.info('Billing rates fetched successfully', { userId, count: rates.length });

    return res.json({
      success: true,
      data: { rates }
    });
  } catch (error) {
    logger.error('Error fetching billing rates', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'BILLING_RATES_FETCH_ERROR',
        message: 'Failed to fetch billing rates'
      }
    });
  }
};

/**
 * Create billing rate
 * 
 * @route POST /api/v1/billing/rates
 * @access Private
 */
export const createBillingRate = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      targetUserId,
      caseType,
      hourlyRate,
      isDefault,
      effectiveDate,
      endDate
    } = req.body;

    logger.info('Creating billing rate', { userId, targetUserId, caseType, hourlyRate });

    const result = await db.query(SQLQueries.BILLING_RATES.CREATE, [
      targetUserId,
      caseType || null,
      hourlyRate,
      isDefault || false,
      effectiveDate,
      endDate || null,
      userId
    ]);

    const rate = result[0];

    logger.businessEvent('billing_rate_created', 'billing_rate', rate.id, userId);

    return res.status(201).json({
      success: true,
      data: { rate }
    });
  } catch (error) {
    logger.error('Error creating billing rate', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'BILLING_RATE_CREATE_ERROR',
        message: 'Failed to create billing rate'
      }
    });
  }
};

export default {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  getBillingRates,
  createBillingRate
};