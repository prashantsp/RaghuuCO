"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const financialDashboardController_1 = __importDefault(require("@/controllers/financialDashboardController"));
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_FINANCIAL_REPORTS), financialDashboardController_1.default.getFinancialOverview);
router.get('/revenue', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_FINANCIAL_REPORTS), financialDashboardController_1.default.getRevenueAnalytics);
router.get('/expenses', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_FINANCIAL_REPORTS), financialDashboardController_1.default.getExpenseAnalytics);
router.get('/pnl', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_FINANCIAL_REPORTS), financialDashboardController_1.default.getProfitLossStatement);
router.get('/cashflow', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_FINANCIAL_REPORTS), financialDashboardController_1.default.getCashFlowAnalysis);
exports.default = router;
//# sourceMappingURL=financialDashboardRoutes.js.map