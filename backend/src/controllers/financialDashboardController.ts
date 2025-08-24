/**
 * Financial Dashboard Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for financial dashboard and comprehensive financial reporting
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Get financial dashboard overview
 * 
 * @route GET /api/v1/financial-dashboard/overview
 * @access Private
 */
export const getFinancialOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Getting financial dashboard overview', { userId });

    // Get current month metrics
    const currentMonthResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_revenue,
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_invoices
      FROM invoices 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Get previous month metrics
    const previousMonthResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue
      FROM invoices 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `);

    // Get yearly metrics
    const yearlyResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue,
        COUNT(*) as total_invoices
      FROM invoices 
      WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)
    `);

    // Get top clients by revenue
    const topClientsResult = await db.query(`
      SELECT 
        c.name as client_name,
        COALESCE(SUM(i.amount), 0) as total_revenue,
        COUNT(i.id) as invoice_count
      FROM clients c
      LEFT JOIN cases cs ON c.id = cs.client_id
      LEFT JOIN invoices i ON cs.id = i.case_id
      WHERE i.created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
      LIMIT 5
    `);

    // Get recent invoices
    const recentInvoicesResult = await db.query(`
      SELECT 
        i.*,
        c.case_number,
        cl.name as client_name
      FROM invoices i
      LEFT JOIN cases c ON i.case_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY i.created_at DESC
      LIMIT 10
    `);

    const overview = {
      currentMonth: currentMonthResult.rows[0],
      previousMonth: previousMonthResult.rows[0],
      yearly: yearlyResult.rows[0],
      topClients: topClientsResult.rows,
      recentInvoices: recentInvoicesResult.rows
    };

    logger.info('Financial dashboard overview fetched successfully', { userId });

    res.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    logger.error('Error getting financial dashboard overview', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FINANCIAL_OVERVIEW_ERROR',
        message: 'Failed to get financial overview'
      }
    });
  }
};

/**
 * Get revenue analytics
 * 
 * @route GET /api/v1/financial-dashboard/revenue
 * @access Private
 */
export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { period = '12' } = req.query;

    logger.info('Getting revenue analytics', { userId, period });

    // Get monthly revenue breakdown
    const monthlyRevenueResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue,
        COUNT(*) as invoice_count
      FROM invoices 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get revenue by case type
    const revenueByCaseTypeResult = await db.query(`
      SELECT 
        cs.case_type,
        COALESCE(SUM(i.amount), 0) as total_revenue,
        COUNT(i.id) as invoice_count
      FROM invoices i
      LEFT JOIN cases cs ON i.case_id = cs.id
      WHERE i.created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY cs.case_type
      ORDER BY total_revenue DESC
    `);

    // Get revenue by lawyer
    const revenueByLawyerResult = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        COALESCE(SUM(i.amount), 0) as total_revenue,
        COUNT(i.id) as invoice_count
      FROM invoices i
      LEFT JOIN cases cs ON i.case_id = cs.id
      LEFT JOIN users u ON cs.assigned_to = u.id
      WHERE i.created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_revenue DESC
    `);

    const analytics = {
      monthlyRevenue: monthlyRevenueResult.rows,
      revenueByCaseType: revenueByCaseTypeResult.rows,
      revenueByLawyer: revenueByLawyerResult.rows
    };

    logger.info('Revenue analytics fetched successfully', { userId });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error getting revenue analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REVENUE_ANALYTICS_ERROR',
        message: 'Failed to get revenue analytics'
      }
    });
  }
};

/**
 * Get expense analytics
 * 
 * @route GET /api/v1/financial-dashboard/expenses
 * @access Private
 */
export const getExpenseAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { period = '12' } = req.query;

    logger.info('Getting expense analytics', { userId, period });

    // Get monthly expenses
    const monthlyExpensesResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as expense_count
      FROM expenses 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get expenses by category
    const expensesByCategoryResult = await db.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as expense_count
      FROM expenses 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY category
      ORDER BY total_expenses DESC
    `);

    // Get recent expenses
    const recentExpensesResult = await db.query(`
      SELECT 
        e.*,
        u.first_name,
        u.last_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC
      LIMIT 20
    `);

    const analytics = {
      monthlyExpenses: monthlyExpensesResult.rows,
      expensesByCategory: expensesByCategoryResult.rows,
      recentExpenses: recentExpensesResult.rows
    };

    logger.info('Expense analytics fetched successfully', { userId });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error getting expense analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPENSE_ANALYTICS_ERROR',
        message: 'Failed to get expense analytics'
      }
    });
  }
};

/**
 * Get profit and loss statement
 * 
 * @route GET /api/v1/financial-dashboard/pnl
 * @access Private
 */
export const getProfitLossStatement = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { year = new Date().getFullYear() } = req.query;

    logger.info('Getting profit and loss statement', { userId, year });

    // Get revenue by month
    const revenueResult = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as revenue
      FROM invoices 
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `, [year]);

    // Get expenses by month
    const expensesResult = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COALESCE(SUM(amount), 0) as expenses
      FROM expenses 
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `, [year]);

    // Calculate profit/loss for each month
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const revenue = revenueResult.rows.find(r => r.month === month)?.revenue || 0;
      const expenses = expensesResult.rows.find(e => e.month === month)?.expenses || 0;
      const profit = revenue - expenses;

      monthlyData.push({
        month,
        revenue,
        expenses,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      });
    }

    // Get yearly totals
    const yearlyTotalsResult = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE EXTRACT(YEAR FROM created_at) = $1) as total_expenses
      FROM invoices 
      WHERE EXTRACT(YEAR FROM created_at) = $1
    `, [year]);

    const totals = yearlyTotalsResult.rows[0];
    const totalProfit = totals.total_revenue - totals.total_expenses;
    const profitMargin = totals.total_revenue > 0 ? (totalProfit / totals.total_revenue) * 100 : 0;

    const pnl = {
      year: parseInt(year as string),
      monthlyData,
      totals: {
        ...totals,
        totalProfit,
        profitMargin
      }
    };

    logger.info('Profit and loss statement fetched successfully', { userId });

    res.json({
      success: true,
      data: { pnl }
    });
  } catch (error) {
    logger.error('Error getting profit and loss statement', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PNL_STATEMENT_ERROR',
        message: 'Failed to get profit and loss statement'
      }
    });
  }
};

/**
 * Get cash flow analysis
 * 
 * @route GET /api/v1/financial-dashboard/cashflow
 * @access Private
 */
export const getCashFlowAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { period = '12' } = req.query;

    logger.info('Getting cash flow analysis', { userId, period });

    // Get cash inflows (paid invoices)
    const cashInflowsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', paid_at) as month,
        COALESCE(SUM(amount), 0) as cash_inflow
      FROM invoices 
      WHERE status = 'paid' 
      AND paid_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY DATE_TRUNC('month', paid_at)
      ORDER BY month DESC
    `);

    // Get cash outflows (expenses)
    const cashOutflowsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(amount), 0) as cash_outflow
      FROM expenses 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get outstanding receivables
    const outstandingReceivablesResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_outstanding,
        COUNT(*) as invoice_count
      FROM invoices 
      WHERE status IN ('pending', 'overdue')
    `);

    // Get cash flow summary
    const cashFlowSummary = {
      cashInflows: cashInflowsResult.rows,
      cashOutflows: cashOutflowsResult.rows,
      outstandingReceivables: outstandingReceivablesResult.rows[0]
    };

    logger.info('Cash flow analysis fetched successfully', { userId });

    res.json({
      success: true,
      data: { cashFlowSummary }
    });
  } catch (error) {
    logger.error('Error getting cash flow analysis', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CASHFLOW_ANALYSIS_ERROR',
        message: 'Failed to get cash flow analysis'
      }
    });
  }
};

export default {
  getFinancialOverview,
  getRevenueAnalytics,
  getExpenseAnalytics,
  getProfitLossStatement,
  getCashFlowAnalysis
};