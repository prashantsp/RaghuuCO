/**
 * Financial Dashboard Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for financial dashboard and comprehensive financial reporting
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getFinancialOverview,
  getRevenueAnalytics,
  getExpenseAnalytics,
  getProfitLossStatement,
  getCashFlowAnalysis
} from '@/controllers/financialDashboardController';

const router = Router();

/**
 * @route GET /api/v1/financial-dashboard/overview
 * @desc Get financial dashboard overview with key metrics
 * @access Private
 */
router.get('/overview', 
  authenticateToken, 
  getFinancialOverview
);

/**
 * @route GET /api/v1/financial-dashboard/revenue
 * @desc Get revenue analytics with detailed breakdown
 * @access Private
 */
router.get('/revenue', 
  authenticateToken, 
  getRevenueAnalytics
);

/**
 * @route GET /api/v1/financial-dashboard/expenses
 * @desc Get expense analytics with categorization
 * @access Private
 */
router.get('/expenses', 
  authenticateToken, 
  getExpenseAnalytics
);

/**
 * @route GET /api/v1/financial-dashboard/pnl
 * @desc Get profit and loss statement
 * @access Private
 */
router.get('/pnl', 
  authenticateToken, 
  getProfitLossStatement
);

/**
 * @route GET /api/v1/financial-dashboard/cashflow
 * @desc Get cash flow analysis
 * @access Private
 */
router.get('/cashflow', 
  authenticateToken, 
  getCashFlowAnalysis
);

export default router;