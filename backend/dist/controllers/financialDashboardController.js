"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashFlowAnalysis = exports.getProfitLossStatement = exports.getExpenseAnalytics = exports.getRevenueAnalytics = exports.getFinancialOverview = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
const getFinancialOverview = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Getting financial dashboard overview', { userId });
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
        const previousMonthResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue
      FROM invoices 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `);
        const yearlyResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue,
        COUNT(*) as total_invoices
      FROM invoices 
      WHERE DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)
    `);
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
            currentMonth: currentMonthResult[0],
            previousMonth: previousMonthResult[0],
            yearly: yearlyResult[0],
            topClients: topClientsResult,
            recentInvoices: recentInvoicesResult
        };
        logger_1.default.info('Financial dashboard overview fetched successfully', { userId });
        res.json({
            success: true,
            data: { overview }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting financial dashboard overview', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FINANCIAL_OVERVIEW_ERROR',
                message: 'Failed to get financial overview'
            }
        });
    }
};
exports.getFinancialOverview = getFinancialOverview;
const getRevenueAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { period = '12' } = req.query;
        logger_1.default.info('Getting revenue analytics', { userId, period });
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
        logger_1.default.info('Revenue analytics fetched successfully', { userId });
        res.json({
            success: true,
            data: { analytics }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting revenue analytics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REVENUE_ANALYTICS_ERROR',
                message: 'Failed to get revenue analytics'
            }
        });
    }
};
exports.getRevenueAnalytics = getRevenueAnalytics;
const getExpenseAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { period = '12' } = req.query;
        logger_1.default.info('Getting expense analytics', { userId, period });
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
        logger_1.default.info('Expense analytics fetched successfully', { userId });
        res.json({
            success: true,
            data: { analytics }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting expense analytics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_ANALYTICS_ERROR',
                message: 'Failed to get expense analytics'
            }
        });
    }
};
exports.getExpenseAnalytics = getExpenseAnalytics;
const getProfitLossStatement = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { year = new Date().getFullYear() } = req.query;
        logger_1.default.info('Getting profit and loss statement', { userId, year });
        const revenueResult = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as revenue
      FROM invoices 
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `, [year]);
        const expensesResult = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COALESCE(SUM(amount), 0) as expenses
      FROM expenses 
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `, [year]);
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
        const yearlyTotalsResult = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE EXTRACT(YEAR FROM created_at) = $1) as total_expenses
      FROM invoices 
      WHERE EXTRACT(YEAR FROM created_at) = $1
    `, [year]);
        const totals = yearlyTotalsResult[0];
        const totalProfit = totals.total_revenue - totals.total_expenses;
        const profitMargin = totals.total_revenue > 0 ? (totalProfit / totals.total_revenue) * 100 : 0;
        const pnl = {
            year: parseInt(year),
            monthlyData,
            totals: {
                ...totals,
                totalProfit,
                profitMargin
            }
        };
        logger_1.default.info('Profit and loss statement fetched successfully', { userId });
        res.json({
            success: true,
            data: { pnl }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting profit and loss statement', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PNL_STATEMENT_ERROR',
                message: 'Failed to get profit and loss statement'
            }
        });
    }
};
exports.getProfitLossStatement = getProfitLossStatement;
const getCashFlowAnalysis = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { period = '12' } = req.query;
        logger_1.default.info('Getting cash flow analysis', { userId, period });
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
        const cashOutflowsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(amount), 0) as cash_outflow
      FROM expenses 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);
        const outstandingReceivablesResult = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_outstanding,
        COUNT(*) as invoice_count
      FROM invoices 
      WHERE status IN ('pending', 'overdue')
    `);
        const cashFlowSummary = {
            cashInflows: cashInflowsResult,
            cashOutflows: cashOutflowsResult,
            outstandingReceivables: outstandingReceivablesResult[0]
        };
        logger_1.default.info('Cash flow analysis fetched successfully', { userId });
        res.json({
            success: true,
            data: { cashFlowSummary }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting cash flow analysis', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CASHFLOW_ANALYSIS_ERROR',
                message: 'Failed to get cash flow analysis'
            }
        });
    }
};
exports.getCashFlowAnalysis = getCashFlowAnalysis;
exports.default = {
    getFinancialOverview: exports.getFinancialOverview,
    getRevenueAnalytics: exports.getRevenueAnalytics,
    getExpenseAnalytics: exports.getExpenseAnalytics,
    getProfitLossStatement: exports.getProfitLossStatement,
    getCashFlowAnalysis: exports.getCashFlowAnalysis
};
//# sourceMappingURL=financialDashboardController.js.map