/**
 * Expenses Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for expenses management functionality including creation, tracking, and reporting
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import expensesController from '@/controllers/expensesController';

const router = Router();

/**
 * @route POST /api/v1/expenses
 * @desc Create expense
 * @access Private
 */
router.post('/', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_EXPENSES),
  expensesController.createExpense
);

/**
 * @route GET /api/v1/expenses
 * @desc Get all expenses
 * @access Private
 */
router.get('/', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getExpenses
);

/**
 * @route GET /api/v1/expenses/search
 * @desc Search expenses
 * @access Private
 */
router.get('/search', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.searchExpenses
);

/**
 * @route GET /api/v1/expenses/categories
 * @desc Get expense categories
 * @access Private
 */
router.get('/categories', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getExpenseCategories
);

/**
 * @route GET /api/v1/expenses/totals/monthly
 * @desc Get monthly expense totals
 * @access Private
 */
router.get('/totals/monthly', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getMonthlyExpenseTotals
);

/**
 * @route GET /api/v1/expenses/case/:caseId
 * @desc Get expenses by case
 * @access Private
 */
router.get('/case/:caseId', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getExpensesByCase
);

/**
 * @route GET /api/v1/expenses/client/:clientId
 * @desc Get expenses by client
 * @access Private
 */
router.get('/client/:clientId', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getExpensesByClient
);

/**
 * @route GET /api/v1/expenses/totals/case/:caseId
 * @desc Get case expense totals
 * @access Private
 */
router.get('/totals/case/:caseId', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getCaseExpenseTotals
);

/**
 * @route GET /api/v1/expenses/totals/client/:clientId
 * @desc Get client expense totals
 * @access Private
 */
router.get('/totals/client/:clientId', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getClientExpenseTotals
);

/**
 * @route GET /api/v1/expenses/:id
 * @desc Get expense by ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_EXPENSES),
  expensesController.getExpenseById
);

/**
 * @route PUT /api/v1/expenses/:id
 * @desc Update expense
 * @access Private
 */
router.put('/:id', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_EXPENSES),
  expensesController.updateExpense
);

/**
 * @route POST /api/v1/expenses/:id/approve
 * @desc Approve expense
 * @access Private
 */
router.post('/:id/approve', 
  authenticateToken, 
  authorizePermission(Permission.APPROVE_EXPENSES),
  expensesController.approveExpense
);

/**
 * @route DELETE /api/v1/expenses/:id
 * @desc Delete expense
 * @access Private
 */
router.delete('/:id', 
  authenticateToken, 
  authorizePermission(Permission.DELETE_EXPENSES),
  expensesController.deleteExpense
);

export default router;