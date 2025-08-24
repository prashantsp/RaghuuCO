/**
 * Expenses Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for expenses management functionality including creation, tracking, and reporting
 */

import { Request, Response } from 'express';
import { expensesService } from '@/services/expensesService';
import logger from '@/utils/logger';

/**
 * Create expense
 * 
 * @route POST /api/v1/expenses
 * @access Private
 */
export const createExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const expenseData = {
      ...req.body,
      createdBy: userId
    };

    logger.info('Creating expense', { userId, description: expenseData.description });

    const result = await expensesService.createExpense(expenseData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating expense', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_CREATE_ERROR',
        message: 'Failed to create expense'
      }
    });
  }
};

/**
 * Get expense by ID
 * 
 * @route GET /api/v1/expenses/:id
 * @access Private
 */
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EXPENSE_ID',
          message: 'Expense ID is required'
        }
      });
    }

    logger.info('Getting expense by ID', { expenseId: id });

    const result = await expensesService.getExpenseById(id);

    res.json(result);
  } catch (error) {
    logger.error('Error getting expense by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_FETCH_ERROR',
        message: 'Failed to get expense'
      }
    });
  }
};

/**
 * Get all expenses
 * 
 * @route GET /api/v1/expenses
 * @access Private
 */
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { caseId, clientId, category, isBillable, isApproved, limit = 20, offset = 0 } = req.query;

    logger.info('Getting expenses', { filters: req.query });

    const result = await expensesService.getExpenses(
      { caseId, clientId, category, isBillable, isApproved },
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting expenses', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSES_FETCH_ERROR',
        message: 'Failed to get expenses'
      }
    });
  }
};

/**
 * Get expenses by case
 * 
 * @route GET /api/v1/expenses/case/:caseId
 * @access Private
 */
export const getExpensesByCase = async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CASE_ID',
          message: 'Case ID is required'
        }
      });
    }

    logger.info('Getting expenses by case', { caseId });

    const result = await expensesService.getExpensesByCase(caseId);

    res.json(result);
  } catch (error) {
    logger.error('Error getting case expenses', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CASE_EXPENSES_ERROR',
        message: 'Failed to get case expenses'
      }
    });
  }
};

/**
 * Get expenses by client
 * 
 * @route GET /api/v1/expenses/client/:clientId
 * @access Private
 */
export const getExpensesByClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CLIENT_ID',
          message: 'Client ID is required'
        }
      });
    }

    logger.info('Getting expenses by client', { clientId });

    const result = await expensesService.getExpensesByClient(clientId);

    res.json(result);
  } catch (error) {
    logger.error('Error getting client expenses', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_EXPENSES_ERROR',
        message: 'Failed to get client expenses'
      }
    });
  }
};

/**
 * Update expense
 * 
 * @route PUT /api/v1/expenses/:id
 * @access Private
 */
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expenseData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EXPENSE_ID',
          message: 'Expense ID is required'
        }
      });
    }

    logger.info('Updating expense', { expenseId: id });

    const result = await expensesService.updateExpense(id, expenseData);

    res.json(result);
  } catch (error) {
    logger.error('Error updating expense', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_UPDATE_ERROR',
        message: 'Failed to update expense'
      }
    });
  }
};

/**
 * Delete expense
 * 
 * @route DELETE /api/v1/expenses/:id
 * @access Private
 */
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EXPENSE_ID',
          message: 'Expense ID is required'
        }
      });
    }

    logger.info('Deleting expense', { expenseId: id });

    const result = await expensesService.deleteExpense(id);

    res.json(result);
  } catch (error) {
    logger.error('Error deleting expense', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_DELETE_ERROR',
        message: 'Failed to delete expense'
      }
    });
  }
};

/**
 * Approve expense
 * 
 * @route POST /api/v1/expenses/:id/approve
 * @access Private
 */
export const approveExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EXPENSE_ID',
          message: 'Expense ID is required'
        }
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User ID is required'
        }
      });
    }

    logger.info('Approving expense', { expenseId: id, userId });

    const result = await expensesService.approveExpense(id, userId);

    res.json(result);
  } catch (error) {
    logger.error('Error approving expense', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_APPROVE_ERROR',
        message: 'Failed to approve expense'
      }
    });
  }
};

/**
 * Get expense categories
 * 
 * @route GET /api/v1/expenses/categories
 * @access Private
 */
export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    logger.info('Getting expense categories');

    const result = await expensesService.getExpenseCategories();

    res.json(result);
  } catch (error) {
    logger.error('Error getting expense categories', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_CATEGORIES_ERROR',
        message: 'Failed to get expense categories'
      }
    });
  }
};

/**
 * Get monthly expense totals
 * 
 * @route GET /api/v1/expenses/totals/monthly
 * @access Private
 */
export const getMonthlyExpenseTotals = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

          if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE_PARAMETERS',
            message: 'Start date and end date are required'
          }
        });
      }

      // Validate date format and range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE_FORMAT',
            message: 'Invalid date format. Please use YYYY-MM-DD format'
          }
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE_RANGE',
            message: 'Start date cannot be after end date'
          }
        });
      }

      // Limit date range to prevent performance issues
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DATE_RANGE_TOO_LARGE',
            message: 'Date range cannot exceed 365 days'
          }
        });
      }

    (logger as any).info('Getting monthly expense totals', { startDate, endDate });

    const result = await expensesService.getMonthlyExpenseTotals(startDate as string || '', endDate as string || '');

    return res.json(result);
  } catch (error) {
    (logger as any).error('Error getting monthly expense totals', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MONTHLY_EXPENSE_TOTALS_ERROR',
        message: 'Failed to get monthly expense totals'
      }
    });
  }
};

/**
 * Get case expense totals
 * 
 * @route GET /api/v1/expenses/totals/case/:caseId
 * @access Private
 */
export const getCaseExpenseTotals = async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CASE_ID',
          message: 'Case ID is required'
        }
      });
    }

    logger.info('Getting case expense totals', { caseId });

    const result = await expensesService.getCaseExpenseTotals(caseId);

    return res.json(result);
  } catch (error) {
    logger.error('Error getting case expense totals', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CASE_EXPENSE_TOTALS_ERROR',
        message: 'Failed to get case expense totals'
      }
    });
  }
};

/**
 * Get client expense totals
 * 
 * @route GET /api/v1/expenses/totals/client/:clientId
 * @access Private
 */
export const getClientExpenseTotals = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CLIENT_ID',
          message: 'Client ID is required'
        }
      });
    }

    logger.info('Getting client expense totals', { clientId });

    const result = await expensesService.getClientExpenseTotals(clientId);

    return res.json(result);
  } catch (error) {
    logger.error('Error getting client expense totals', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_EXPENSE_TOTALS_ERROR',
        message: 'Failed to get client expense totals'
      }
    });
  }
};

/**
 * Search expenses
 * 
 * @route GET /api/v1/expenses/search
 * @access Private
 */
export const searchExpenses = async (req: Request, res: Response) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: 'Search query is required'
        }
      });
    }

    logger.info('Searching expenses', { query: q, limit, offset });

    const result = await expensesService.searchExpenses(
      q as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    return res.json(result);
  } catch (error) {
    logger.error('Error searching expenses', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_SEARCH_ERROR',
        message: 'Failed to search expenses'
      }
    });
  }
};

export default {
  createExpense,
  getExpenseById,
  getExpenses,
  getExpensesByCase,
  getExpensesByClient,
  updateExpense,
  deleteExpense,
  approveExpense,
  getExpenseCategories,
  getMonthlyExpenseTotals,
  getCaseExpenseTotals,
  getClientExpenseTotals,
  searchExpenses
};