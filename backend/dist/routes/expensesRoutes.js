"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const expensesController_1 = __importDefault(require("@/controllers/expensesController"));
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_EXPENSES), expensesController_1.default.createExpense);
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getExpenses);
router.get('/search', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.searchExpenses);
router.get('/categories', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getExpenseCategories);
router.get('/totals/monthly', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getMonthlyExpenseTotals);
router.get('/case/:caseId', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getExpensesByCase);
router.get('/client/:clientId', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getExpensesByClient);
router.get('/totals/case/:caseId', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getCaseExpenseTotals);
router.get('/totals/client/:clientId', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getClientExpenseTotals);
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_EXPENSES), expensesController_1.default.getExpenseById);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_EXPENSES), expensesController_1.default.updateExpense);
router.post('/:id/approve', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.APPROVE_EXPENSES), expensesController_1.default.approveExpense);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_EXPENSES), expensesController_1.default.deleteExpense);
exports.default = router;
//# sourceMappingURL=expensesRoutes.js.map