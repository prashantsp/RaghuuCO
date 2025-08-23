/**
 * Financial Dashboard Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
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
    const { startDate, endDate } = req.query;

    logger.info('Getting financial dashboard overview', { userId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1); // Start of year
    const end = endDate || new Date();

    // Get revenue data
    const revenueResult = await db.query(`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_invoices,
        AVG(amount) as average_invoice_value
      FROM invoices 
      WHERE status = 'paid' 
      AND created_at >= $1 AND created_at <= $2
    `, [start, end]);

    // Get outstanding invoices
    const outstandingResult = await db.query(`
      SELECT 
        SUM(amount) as total_outstanding,
        COUNT(*) as outstanding_count
      FROM invoices 
      WHERE status IN ('pending', 'overdue')
    `);

    // Get expenses
    const expensesResult = await db.query(`
      SELECT 
        SUM(metric_value) as total_expenses
      FROM business_metrics 
      WHERE metric_type = 'expense'
      AND metric_date >= $1 AND metric_date <= $2
    `, [start, end]);

    // Get case revenue
    const caseRevenueResult = await db.query(`
      SELECT 
        c.id,
        c.case_number,
        c.title,
        cl.name as client_name,
        SUM(i.amount) as total_revenue,
        COUNT(i.id) as invoice_count
      FROM cases c
      JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN invoices i ON c.id = i.case_id AND i.status = 'paid'
      WHERE i.created_at >= $1 AND i.created_at <= $2
      GROUP BY c.id, c.case_number, c.title, cl.name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [start, end]);

    // Get monthly revenue trend
    const monthlyTrendResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as invoice_count
      FROM invoices 
      WHERE status = 'paid'
      AND created_at >= $1 AND created_at <= $2
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `, [start, end]);

    const overview = {
      revenue: {
        total: parseFloat(revenueResult.rows[0]?.total_revenue || '0'),
        invoiceCount: parseInt(revenueResult.rows[0]?.total_invoices || '0'),
        averageValue: parseFloat(revenueResult.rows[0]?.average_invoice_value || '0')
      },
      outstanding: {
        total: parseFloat(outstandingResult.rows[0]?.total_outstanding || '0'),
        count: parseInt(outstandingResult.rows[0]?.outstanding_count || '0')
      },
      expenses: {
        total: parseFloat(expensesResult.rows[0]?.total_expenses || '0')
      },
      profit: {
        total: parseFloat(revenueResult.rows[0]?.total_revenue || '0') - parseFloat(expensesResult.rows[0]?.total_expenses || '0')
      },
      topCases: caseRevenueResult.rows,
      monthlyTrend: monthlyTrendResult.rows
    };

    logger.info('Financial overview fetched successfully', { userId });

    res.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    logger.error('Error getting financial overview', error as Error);
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
    const { startDate, endDate, groupBy = 'month' } = req.query;

    logger.info('Getting revenue analytics', { userId, startDate, endDate, groupBy });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    let timeGroup: string;
    switch (groupBy) {
      case 'day':
        timeGroup = 'DATE_TRUNC(\'day\', created_at)';
        break;
      case 'week':
        timeGroup = 'DATE_TRUNC(\'week\', created_at)';
        break;
      case 'month':
      default:
        timeGroup = 'DATE_TRUNC(\'month\', created_at)';
        break;
      case 'quarter':
        timeGroup = 'DATE_TRUNC(\'quarter\', created_at)';
        break;
      case 'year':
        timeGroup = 'DATE_TRUNC(\'year\', created_at)';
        break;
    }

    // Get revenue by time period
    const revenueByTimeResult = await db.query(`
      SELECT 
        ${timeGroup} as time_period,
        SUM(amount) as revenue,
        COUNT(*) as invoice_count,
        AVG(amount) as average_invoice
      FROM invoices 
      WHERE status = 'paid'
      AND created_at >= $1 AND created_at <= $2
      GROUP BY ${timeGroup}
      ORDER BY time_period
    `, [start, end]);

    // Get revenue by client
    const revenueByClientResult = await db.query(`
      SELECT 
        cl.id,
        cl.name as client_name,
        SUM(i.amount) as total_revenue,
        COUNT(i.id) as invoice_count,
        AVG(i.amount) as average_invoice
      FROM invoices i
      JOIN cases c ON i.case_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE i.status = 'paid'
      AND i.created_at >= $1 AND i.created_at <= $2
      GROUP BY cl.id, cl.name
      ORDER BY total_revenue DESC
      LIMIT 20
    `, [start, end]);

    // Get revenue by case type
    const revenueByCaseTypeResult = await db.query(`
      SELECT 
        c.case_type,
        SUM(i.amount) as total_revenue,
        COUNT(i.id) as invoice_count,
        AVG(i.amount) as average_invoice
      FROM invoices i
      JOIN cases c ON i.case_id = c.id
      WHERE i.status = 'paid'
      AND i.created_at >= $1 AND i.created_at <= $2
      GROUP BY c.case_type
      ORDER BY total_revenue DESC
    `, [start, end]);

    const analytics = {
      revenueByTime: revenueByTimeResult.rows,
      revenueByClient: revenueByClientResult.rows,
      revenueByCaseType: revenueByCaseTypeResult.rows
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
    const { startDate, endDate } = req.query;

    logger.info('Getting expense analytics', { userId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get expenses by category
    const expensesByCategoryResult = await db.query(`
      SELECT 
        additional_data->>'category' as category,
        SUM(metric_value) as total_expense,
        COUNT(*) as expense_count
      FROM business_metrics 
      WHERE metric_type = 'expense'
      AND metric_date >= $1 AND metric_date <= $2
      GROUP BY additional_data->>'category'
      ORDER BY total_expense DESC
    `, [start, end]);

    // Get monthly expense trend
    const monthlyExpenseResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', metric_date) as month,
        SUM(metric_value) as total_expense,
        COUNT(*) as expense_count
      FROM business_metrics 
      WHERE metric_type = 'expense'
      AND metric_date >= $1 AND metric_date <= $2
      GROUP BY DATE_TRUNC('month', metric_date)
      ORDER BY month
    `, [start, end]);

    // Get expense breakdown
    const expenseBreakdownResult = await db.query(`
      SELECT 
        metric_value,
        additional_data,
        metric_date
      FROM business_metrics 
      WHERE metric_type = 'expense'
      AND metric_date >= $1 AND metric_date <= $2
      ORDER BY metric_date DESC
      LIMIT 50
    `, [start, end]);

    const analytics = {
      expensesByCategory: expensesByCategoryResult.rows,
      monthlyExpense: monthlyExpenseResult.rows,
      expenseBreakdown: expenseBreakdownResult.rows
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
    const { startDate, endDate } = req.query;

    logger.info('Getting profit and loss statement', { userId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get total revenue
    const revenueResult = await db.query(`
      SELECT SUM(amount) as total_revenue
      FROM invoices 
      WHERE status = 'paid'
      AND created_at >= $1 AND created_at <= $2
    `, [start, end]);

    // Get total expenses
    const expensesResult = await db.query(`
      SELECT SUM(metric_value) as total_expenses
      FROM business_metrics 
      WHERE metric_type = 'expense'
      AND metric_date >= $1 AND metric_date <= $2
    `, [start, end]);

    // Get outstanding receivables
    const outstandingResult = await db.query(`
      SELECT SUM(amount) as total_outstanding
      FROM invoices 
      WHERE status IN ('pending', 'overdue')
      AND created_at >= $1 AND created_at <= $2
    `, [start, end]);

    // Get monthly P&L
    const monthlyPnLResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', i.created_at) as month,
        SUM(i.amount) as revenue,
        COALESCE(SUM(bm.metric_value), 0) as expenses,
        SUM(i.amount) - COALESCE(SUM(bm.metric_value), 0) as profit
      FROM invoices i
      LEFT JOIN business_metrics bm ON DATE_TRUNC('month', i.created_at) = DATE_TRUNC('month', bm.metric_date) 
        AND bm.metric_type = 'expense'
      WHERE i.status = 'paid'
      AND i.created_at >= $1 AND i.created_at <= $2
      GROUP BY DATE_TRUNC('month', i.created_at)
      ORDER BY month
    `, [start, end]);

    const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || '0');
    const totalExpenses = parseFloat(expensesResult.rows[0]?.total_expenses || '0');
    const totalOutstanding = parseFloat(outstandingResult.rows[0]?.total_outstanding || '0');

    const pnl = {
      revenue: {
        total: totalRevenue,
        outstanding: totalOutstanding
      },
      expenses: {
        total: totalExpenses
      },
      profit: {
        gross: totalRevenue - totalExpenses,
        margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
      },
      monthlyPnL: monthlyPnLResult.rows
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
    const { startDate, endDate } = req.query;

    logger.info('Getting cash flow analysis', { userId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get cash inflows (paid invoices)
    const cashInflowsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as cash_inflow
      FROM invoices 
      WHERE status = 'paid'
      AND created_at >= $1 AND created_at <= $2
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `, [start, end]);

    // Get cash outflows (expenses)
    const cashOutflowsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', metric_date) as month,
        SUM(metric_value) as cash_outflow
      FROM business_metrics 
      WHERE metric_type = 'expense'
      AND metric_date >= $1 AND metric_date <= $2
      GROUP BY DATE_TRUNC('month', metric_date)
      ORDER BY month
    `, [start, end]);

    // Get accounts receivable aging
    const accountsReceivableResult = await db.query(`
      SELECT 
        CASE 
          WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN '0-30 days'
          WHEN created_at >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
          WHEN created_at >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
          ELSE 'Over 90 days'
        END as aging_bucket,
        SUM(amount) as total_amount,
        COUNT(*) as invoice_count
      FROM invoices 
      WHERE status IN ('pending', 'overdue')
      GROUP BY aging_bucket
      ORDER BY 
        CASE aging_bucket
          WHEN '0-30 days' THEN 1
          WHEN '31-60 days' THEN 2
          WHEN '61-90 days' THEN 3
          ELSE 4
        END
    `);

    const cashFlow = {
      inflows: cashInflowsResult.rows,
      outflows: cashOutflowsResult.rows,
      accountsReceivable: accountsReceivableResult.rows
    };

    logger.info('Cash flow analysis fetched successfully', { userId });

    res.json({
      success: true,
      data: { cashFlow }
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