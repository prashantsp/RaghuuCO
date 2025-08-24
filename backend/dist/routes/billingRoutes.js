"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const billingController_1 = require("@/controllers/billingController");
const router = (0, express_1.Router)();
router.get('/invoices', auth_1.authenticateToken, billingController_1.getInvoices);
router.get('/invoices/stats', auth_1.authenticateToken, billingController_1.getInvoiceStats);
router.get('/invoices/:id', auth_1.authenticateToken, billingController_1.getInvoiceById);
router.post('/invoices', auth_1.authenticateToken, billingController_1.createInvoice);
router.put('/invoices/:id', auth_1.authenticateToken, billingController_1.updateInvoice);
router.delete('/invoices/:id', auth_1.authenticateToken, billingController_1.deleteInvoice);
router.get('/rates', auth_1.authenticateToken, billingController_1.getBillingRates);
router.post('/rates', auth_1.authenticateToken, billingController_1.createBillingRate);
exports.default = router;
//# sourceMappingURL=billingRoutes.js.map