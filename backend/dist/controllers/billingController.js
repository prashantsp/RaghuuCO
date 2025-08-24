"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBillingRate = exports.getBillingRates = exports.getInvoiceStats = exports.deleteInvoice = exports.updateInvoice = exports.createInvoice = exports.getInvoiceById = exports.getInvoices = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const taxService_1 = require("@/services/taxService");
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.default();
const getInvoices = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, search, status, clientId, userId: filterUserId } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching invoices', { userId, filters: req.query });
        const result = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.SEARCH, [
            search || null,
            status || null,
            clientId || null,
            filterUserId || null,
            parseInt(limit),
            offset
        ]);
        const invoices = result;
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
        const totalPages = Math.ceil(total / parseInt(limit));
        logger_1.default.info('Invoices fetched successfully', { userId, count: invoices.length });
        return res.json({
            success: true,
            data: {
                invoices,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching invoices', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INVOICES_FETCH_ERROR',
                message: 'Failed to fetch invoices'
            }
        });
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Fetching invoice by ID', { userId, invoiceId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.GET_BY_ID, [id]);
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
        const itemsResult = await db.query(db_SQLQueries_1.SQLQueries.INVOICE_ITEMS.GET_BY_INVOICE_ID, [id]);
        const items = itemsResult;
        const paymentsResult = await db.query(db_SQLQueries_1.SQLQueries.PAYMENTS.GET_BY_INVOICE_ID, [id]);
        const payments = paymentsResult;
        logger_1.default.info('Invoice fetched successfully', { userId, invoiceId: id });
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
    }
    catch (error) {
        logger_1.default.error('Error fetching invoice', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INVOICE_FETCH_ERROR',
                message: 'Failed to fetch invoice'
            }
        });
    }
};
exports.getInvoiceById = getInvoiceById;
const createInvoice = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { caseId, clientId, userId: invoiceUserId, dueDate, notes, termsConditions, items } = req.body;
        logger_1.default.info('Creating new invoice', { userId, caseId, clientId });
        const numberResult = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.GENERATE_INVOICE_NUMBER);
        const invoiceNumber = numberResult[0]?.next_number || `INV-${Date.now()}`;
        let subtotal = 0;
        if (items && Array.isArray(items)) {
            subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        }
        const clientResult = await db.query(db_SQLQueries_1.SQLQueries.CLIENTS.GET_CLIENT_TYPE, [clientId]);
        const clientType = clientResult[0]?.client_type || 'individual';
        const taxCalculation = taxService_1.taxService.calculateInvoiceTax({
            subtotal,
            isInterState: false,
            isTDSApplicable: clientType === 'company',
            clientType: clientType
        });
        const taxAmount = taxCalculation.totalTax;
        const totalAmount = taxCalculation.grandTotal;
        const invoiceResult = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.CREATE, [
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
        if (items && Array.isArray(items)) {
            for (const item of items) {
                await db.query(db_SQLQueries_1.SQLQueries.INVOICE_ITEMS.CREATE, [
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
        logger_1.default.businessEvent('invoice_created', 'invoice', invoice.id || '', userId || '');
        return res.status(201).json({
            success: true,
            data: { invoice }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating invoice', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INVOICE_CREATE_ERROR',
                message: 'Failed to create invoice'
            }
        });
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { status, dueDate, issuedDate, paidDate, paymentMethod, notes, termsConditions, items } = req.body;
        logger_1.default.info('Updating invoice', { userId, invoiceId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.GET_BY_ID, [id]);
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
        let subtotal = currentInvoice.subtotal;
        let totalAmount = currentInvoice.total_amount;
        if (items && Array.isArray(items)) {
            await db.query(db_SQLQueries_1.SQLQueries.INVOICE_ITEMS.DELETE_BY_INVOICE_ID, [id]);
            subtotal = 0;
            for (const item of items) {
                await db.query(db_SQLQueries_1.SQLQueries.INVOICE_ITEMS.CREATE, [
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
            const clientResult = await db.query(db_SQLQueries_1.SQLQueries.CLIENTS.GET_CLIENT_TYPE, [currentInvoice.client_id]);
            const clientType = clientResult[0]?.client_type || 'individual';
            const taxCalculation = taxService_1.taxService.calculateInvoiceTax({
                subtotal,
                isInterState: false,
                isTDSApplicable: clientType === 'company',
                clientType: clientType
            });
            totalAmount = taxCalculation.grandTotal;
        }
        const result = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.UPDATE, [
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
        logger_1.default.businessEvent('invoice_updated', 'invoice', id || '', userId || '');
        return res.json({
            success: true,
            data: { invoice: updatedInvoice }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating invoice', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INVOICE_UPDATE_ERROR',
                message: 'Failed to update invoice'
            }
        });
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Deleting invoice', { userId, invoiceId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.GET_BY_ID, [id]);
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
        if (invoice.status !== 'draft') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVOICE_DELETE_ERROR',
                    message: 'Only draft invoices can be deleted'
                }
            });
        }
        await db.query(db_SQLQueries_1.SQLQueries.INVOICES.DELETE, [id]);
        logger_1.default.businessEvent('invoice_deleted', 'invoice', id || '', userId || '');
        return res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting invoice', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INVOICE_DELETE_ERROR',
                message: 'Failed to delete invoice'
            }
        });
    }
};
exports.deleteInvoice = deleteInvoice;
const getInvoiceStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { clientId } = req.query;
        logger_1.default.info('Fetching invoice statistics', { userId, clientId });
        const result = await db.query(db_SQLQueries_1.SQLQueries.INVOICES.GET_STATS, [userId, clientId || null]);
        const stats = result[0];
        logger_1.default.info('Invoice statistics fetched successfully', { userId, stats });
        return res.json({
            success: true,
            data: { stats }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching invoice statistics', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'INVOICE_STATS_ERROR',
                message: 'Failed to fetch invoice statistics'
            }
        });
    }
};
exports.getInvoiceStats = getInvoiceStats;
const getBillingRates = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { search, caseType, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching billing rates', { userId, filters: req.query });
        const result = await db.query(db_SQLQueries_1.SQLQueries.BILLING_RATES.SEARCH, [
            search || null,
            caseType || null,
            parseInt(limit),
            offset
        ]);
        const rates = result;
        logger_1.default.info('Billing rates fetched successfully', { userId, count: rates.length });
        return res.json({
            success: true,
            data: { rates }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching billing rates', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'BILLING_RATES_FETCH_ERROR',
                message: 'Failed to fetch billing rates'
            }
        });
    }
};
exports.getBillingRates = getBillingRates;
const createBillingRate = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { targetUserId, caseType, hourlyRate, isDefault, effectiveDate, endDate } = req.body;
        logger_1.default.info('Creating billing rate', { userId, targetUserId, caseType, hourlyRate });
        const result = await db.query(db_SQLQueries_1.SQLQueries.BILLING_RATES.CREATE, [
            targetUserId,
            caseType || null,
            hourlyRate,
            isDefault || false,
            effectiveDate,
            endDate || null,
            userId
        ]);
        const rate = result[0];
        logger_1.default.businessEvent('billing_rate_created', 'billing_rate', rate.id, userId);
        return res.status(201).json({
            success: true,
            data: { rate }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating billing rate', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'BILLING_RATE_CREATE_ERROR',
                message: 'Failed to create billing rate'
            }
        });
    }
};
exports.createBillingRate = createBillingRate;
exports.default = {
    getInvoices: exports.getInvoices,
    getInvoiceById: exports.getInvoiceById,
    createInvoice: exports.createInvoice,
    updateInvoice: exports.updateInvoice,
    deleteInvoice: exports.deleteInvoice,
    getInvoiceStats: exports.getInvoiceStats,
    getBillingRates: exports.getBillingRates,
    createBillingRate: exports.createBillingRate
};
//# sourceMappingURL=billingController.js.map