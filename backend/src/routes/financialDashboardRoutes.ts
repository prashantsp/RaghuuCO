/**
 * Financial Dashboard Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description API routes for financial dashboard and comprehensive financial reporting
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import financialDashboardController from '@/controllers/financialDashboardController';

const router = Router();

/**
 * @route GET /api/v1/financial-dashboard/overview
 * @desc Get financial dashboard overview with key metrics
 * @access Private
 */
router.get('/overview', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_FINANCIAL_REPORTS),
  financialDashboardController.getFinancialOverview
);

/**
 * @route GET /api/v1/financial-dashboard/revenue
 * @desc Get revenue analytics with detailed breakdown
 * @access Private
 */
router.get('/revenue', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_FINANCIAL_REPORTS),
  financialDashboardController.getRevenueAnalytics
);

/**
 * @route GET /api/v1/financial-dashboard/expenses
 * @desc Get expense analytics with categorization
 * @access Private
 */
router.get('/expenses', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_FINANCIAL_REPORTS),
  financialDashboardController.getExpenseAnalytics
);

/**
 * @route GET /api/v1/financial-dashboard/pnl
 * @desc Get profit and loss statement
 * @access Private
 */
router.get('/pnl', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_FINANCIAL_REPORTS),
  financialDashboardController.getProfitLossStatement
);

/**
 * @route GET /api/v1/financial-dashboard/cashflow
 * @desc Get cash flow analysis
 * @access Private
 */
router.get('/cashflow', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_FINANCIAL_REPORTS),
  financialDashboardController.getCashFlowAnalysis
);

export default router;