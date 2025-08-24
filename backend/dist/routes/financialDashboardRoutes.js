"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const financialDashboardController_1 = require("@/controllers/financialDashboardController");
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authenticateToken, financialDashboardController_1.getFinancialOverview);
router.get('/revenue', auth_1.authenticateToken, financialDashboardController_1.getRevenueAnalytics);
router.get('/expenses', auth_1.authenticateToken, financialDashboardController_1.getExpenseAnalytics);
router.get('/pnl', auth_1.authenticateToken, financialDashboardController_1.getProfitLossStatement);
router.get('/cashflow', auth_1.authenticateToken, financialDashboardController_1.getCashFlowAnalysis);
exports.default = router;
//# sourceMappingURL=financialDashboardRoutes.js.map