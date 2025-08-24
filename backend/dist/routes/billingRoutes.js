"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const billingController_1 = __importDefault(require("@/controllers/billingController"));
const router = (0, express_1.Router)();
router.get('/invoices', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_INVOICES), billingController_1.default.getInvoices);
router.get('/invoices/stats', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_INVOICES), billingController_1.default.getInvoiceStats);
router.get('/invoices/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_INVOICES), billingController_1.default.getInvoiceById);
router.post('/invoices', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_INVOICES), billingController_1.default.createInvoice);
router.put('/invoices/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_INVOICES), billingController_1.default.updateInvoice);
router.delete('/invoices/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_INVOICES), billingController_1.default.deleteInvoice);
router.get('/rates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_BILLING_RATES), billingController_1.default.getBillingRates);
router.post('/rates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_BILLING_RATES), billingController_1.default.createBillingRate);
exports.default = router;
//# sourceMappingURL=billingRoutes.js.map