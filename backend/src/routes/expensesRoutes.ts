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
import {
  createExpense,
  getExpenses,
  searchExpenses,
  getExpenseCategories,
  getMonthlyExpenseTotals,
  getExpensesByCase,
  getExpensesByClient,
  getCaseExpenseTotals,
  getClientExpenseTotals,
  getExpenseById,
  updateExpense,
  deleteExpense,
  approveExpense
} from '@/controllers/expensesController';

const router = Router();

/**
 * @route POST /api/v1/expenses
 * @desc Create expense
 * @access Private
 */
router.post('/', 
  authenticateToken, 
  createExpense
);

/**
 * @route GET /api/v1/expenses
 * @desc Get all expenses
 * @access Private
 */
router.get('/', 
  authenticateToken, 
  getExpenses
);

/**
 * @route GET /api/v1/expenses/search
 * @desc Search expenses
 * @access Private
 */
router.get('/search', 
  authenticateToken, 
  searchExpenses
);

/**
 * @route GET /api/v1/expenses/categories
 * @desc Get expense categories
 * @access Private
 */
router.get('/categories', 
  authenticateToken, 
  getExpenseCategories
);

/**
 * @route GET /api/v1/expenses/totals/monthly
 * @desc Get monthly expense totals
 * @access Private
 */
router.get('/totals/monthly', 
  authenticateToken, 
  getMonthlyExpenseTotals
);

/**
 * @route GET /api/v1/expenses/case/:caseId
 * @desc Get expenses by case
 * @access Private
 */
router.get('/case/:caseId', 
  authenticateToken, 
  getExpensesByCase
);

/**
 * @route GET /api/v1/expenses/client/:clientId
 * @desc Get expenses by client
 * @access Private
 */
router.get('/client/:clientId', 
  authenticateToken, 
  getExpensesByClient
);

/**
 * @route GET /api/v1/expenses/totals/case/:caseId
 * @desc Get case expense totals
 * @access Private
 */
router.get('/totals/case/:caseId', 
  authenticateToken, 
  getCaseExpenseTotals
);

/**
 * @route GET /api/v1/expenses/totals/client/:clientId
 * @desc Get client expense totals
 * @access Private
 */
router.get('/totals/client/:clientId', 
  authenticateToken, 
  getClientExpenseTotals
);

/**
 * @route GET /api/v1/expenses/:id
 * @desc Get expense by ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken, 
  getExpenseById
);

/**
 * @route PUT /api/v1/expenses/:id
 * @desc Update expense
 * @access Private
 */
router.put('/:id', 
  authenticateToken, 
  updateExpense
);

/**
 * @route POST /api/v1/expenses/:id/approve
 * @desc Approve expense
 * @access Private
 */
router.post('/:id/approve', 
  authenticateToken, 
  approveExpense
);

/**
 * @route DELETE /api/v1/expenses/:id
 * @desc Delete expense
 * @access Private
 */
router.delete('/:id', 
  authenticateToken, 
  deleteExpense
);

export default router;