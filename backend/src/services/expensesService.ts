/**
 * Expenses Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for managing expenses, including creation, tracking, and reporting
 */

import DatabaseService from './DatabaseService';
import logger from '../utils/logger';
import { SQLQueries } from '../utils/db_SQLQueries';

const db = new DatabaseService();

/**
 * Expenses Service Class
 * Handles all expense management operations
 */
export class ExpensesService {
  /**
   * Create expense
   */
  async createExpense(expenseData: any): Promise<any> {
    try {
      const {
        description,
        amount,
        category,
        expenseDate,
        caseId,
        clientId,
        createdBy,
        notes,
        receiptUrl,
        isBillable
      } = expenseData;

      logger.info('Creating expense', { description, amount, category, createdBy });

      const result = await db.query(SQLQueries.EXPENSES.CREATE, [
        description,
        amount,
        category,
        expenseDate,
        caseId || null,
        clientId || null,
        createdBy,
        notes || null,
        receiptUrl || null,
        isBillable || false
      ]);

      const expense = result[0];

      logger.businessEvent('expense_created', 'expense', expense.id, createdBy);

      return {
        success: true,
        data: { expense }
      };
    } catch (error) {
      logger.error('Error creating expense', error as Error);
      throw new Error('Failed to create expense');
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: string): Promise<any> {
    try {
      logger.info('Getting expense by ID', { expenseId });

      const result = await db.query(SQLQueries.EXPENSES.GET_BY_ID, [expenseId]);
      const expense = result[0];

      if (!expense) {
        throw new Error('Expense not found');
      }

      logger.info('Expense fetched successfully', { expenseId });

      return {
        success: true,
        data: { expense }
      };
    } catch (error) {
      logger.error('Error getting expense by ID', error as Error);
      throw new Error('Failed to get expense');
    }
  }

  /**
   * Get all expenses with filtering
   */
  async getExpenses(filters: any = {}, limit: number = 20, offset: number = 0): Promise<any> {
    try {
      const { caseId, clientId, category, isBillable, isApproved } = filters;

      logger.info('Getting expenses', { filters, limit, offset });

      const result = await db.query(SQLQueries.EXPENSES.GET_ALL, [
        caseId || null,
        clientId || null,
        category || null,
        isBillable !== undefined ? isBillable : null,
        isApproved !== undefined ? isApproved : null,
        limit,
        offset
      ]);

      const expenses = result;

      logger.info('Expenses fetched successfully', { count: expenses.length });

      return {
        success: true,
        data: { expenses }
      };
    } catch (error) {
      logger.error('Error getting expenses', error as Error);
      throw new Error('Failed to get expenses');
    }
  }

  /**
   * Get expenses by case
   */
  async getExpensesByCase(caseId: string): Promise<any> {
    try {
      logger.info('Getting expenses by case', { caseId });

      const result = await db.query(SQLQueries.EXPENSES.GET_BY_CASE, [caseId]);
      const expenses = result;

      logger.info('Case expenses fetched successfully', { caseId, count: expenses.length });

      return {
        success: true,
        data: { expenses }
      };
    } catch (error) {
      logger.error('Error getting case expenses', error as Error);
      throw new Error('Failed to get case expenses');
    }
  }

  /**
   * Get expenses by client
   */
  async getExpensesByClient(clientId: string): Promise<any> {
    try {
      logger.info('Getting expenses by client', { clientId });

      const result = await db.query(SQLQueries.EXPENSES.GET_BY_CLIENT, [clientId]);
      const expenses = result;

      logger.info('Client expenses fetched successfully', { clientId, count: expenses.length });

      return {
        success: true,
        data: { expenses }
      };
    } catch (error) {
      logger.error('Error getting client expenses', error as Error);
      throw new Error('Failed to get client expenses');
    }
  }

  /**
   * Update expense
   */
  async updateExpense(expenseId: string, expenseData: any): Promise<any> {
    try {
      const {
        description,
        amount,
        category,
        expenseDate,
        caseId,
        clientId,
        notes,
        receiptUrl,
        isBillable
      } = expenseData;

      logger.info('Updating expense', { expenseId });

      const result = await db.query(SQLQueries.EXPENSES.UPDATE, [
        expenseId,
        description,
        amount,
        category,
        expenseDate,
        caseId || null,
        clientId || null,
        notes || null,
        receiptUrl || null,
        isBillable || false
      ]);

      const expense = result[0];

      if (!expense) {
        throw new Error('Expense not found');
      }

      logger.businessEvent('expense_updated', 'expense', expenseId, '');

      return {
        success: true,
        data: { expense }
      };
    } catch (error) {
      logger.error('Error updating expense', error as Error);
      throw new Error('Failed to update expense');
    }
  }

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: string): Promise<any> {
    try {
      logger.info('Deleting expense', { expenseId });

      const result = await db.query(SQLQueries.EXPENSES.DELETE, [expenseId]);

      if (result.length === 0) {
        throw new Error('Expense not found');
      }

      logger.businessEvent('expense_deleted', 'expense', expenseId, '');

      return {
        success: true,
        message: 'Expense deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting expense', error as Error);
      throw new Error('Failed to delete expense');
    }
  }

  /**
   * Approve expense
   */
  async approveExpense(expenseId: string, approvedBy: string): Promise<any> {
    try {
      logger.info('Approving expense', { expenseId, approvedBy });

      const result = await db.query(SQLQueries.EXPENSES.APPROVE, [expenseId, approvedBy]);
      const expense = result[0];

      if (!expense) {
        throw new Error('Expense not found');
      }

      logger.businessEvent('expense_approved', 'expense', expenseId, approvedBy);

      return {
        success: true,
        data: { expense }
      };
    } catch (error) {
      logger.error('Error approving expense', error as Error);
      throw new Error('Failed to approve expense');
    }
  }

  /**
   * Get expense categories
   */
  async getExpenseCategories(): Promise<any> {
    try {
      logger.info('Getting expense categories');

      const result = await db.query(SQLQueries.EXPENSES.GET_CATEGORIES);
      const categories = result;

      logger.info('Expense categories fetched successfully', { count: categories.length });

      return {
        success: true,
        data: { categories }
      };
    } catch (error) {
      logger.error('Error getting expense categories', error as Error);
      throw new Error('Failed to get expense categories');
    }
  }

  /**
   * Get monthly expense totals
   */
  async getMonthlyExpenseTotals(startDate: string, endDate: string): Promise<any> {
    try {
      logger.info('Getting monthly expense totals', { startDate, endDate });

      const result = await db.query(SQLQueries.EXPENSES.GET_MONTHLY_TOTALS, [startDate, endDate]);
      const totals = result;

      logger.info('Monthly expense totals fetched successfully', { count: totals.length });

      return {
        success: true,
        data: { totals }
      };
    } catch (error) {
      logger.error('Error getting monthly expense totals', error as Error);
      throw new Error('Failed to get monthly expense totals');
    }
  }

  /**
   * Get case expense totals
   */
  async getCaseExpenseTotals(caseId: string): Promise<any> {
    try {
      logger.info('Getting case expense totals', { caseId });

      const result = await db.query(SQLQueries.EXPENSES.GET_CASE_TOTALS, [caseId]);
      const totals = result[0];

      logger.info('Case expense totals fetched successfully', { caseId });

      return {
        success: true,
        data: { totals }
      };
    } catch (error) {
      logger.error('Error getting case expense totals', error as Error);
      throw new Error('Failed to get case expense totals');
    }
  }

  /**
   * Get client expense totals
   */
  async getClientExpenseTotals(clientId: string): Promise<any> {
    try {
      logger.info('Getting client expense totals', { clientId });

      const result = await db.query(SQLQueries.EXPENSES.GET_CLIENT_TOTALS, [clientId]);
      const totals = result[0];

      logger.info('Client expense totals fetched successfully', { clientId });

      return {
        success: true,
        data: { totals }
      };
    } catch (error) {
      logger.error('Error getting client expense totals', error as Error);
      throw new Error('Failed to get client expense totals');
    }
  }

  /**
   * Search expenses
   */
  async searchExpenses(query: string, limit: number = 20, offset: number = 0): Promise<any> {
    try {
      logger.info('Searching expenses', { query, limit, offset });

      const result = await db.query(SQLQueries.EXPENSES.SEARCH, [
        `%${query}%`,
        limit,
        offset
      ]);

      const expenses = result;

      logger.info('Expense search completed successfully', { query, count: expenses.length });

      return {
        success: true,
        data: { expenses }
      };
    } catch (error) {
      logger.error('Error searching expenses', error as Error);
      throw new Error('Failed to search expenses');
    }
  }
}

// Export service instance
export const expensesService = new ExpensesService();