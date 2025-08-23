/**
 * Productivity Analytics Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description API routes for productivity analytics and performance tracking
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import productivityAnalyticsController from '@/controllers/productivityAnalyticsController';

const router = Router();

/**
 * @route GET /api/v1/productivity-analytics/overview
 * @desc Get productivity overview with key metrics
 * @access Private
 */
router.get('/overview', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_PRODUCTIVITY_REPORTS),
  productivityAnalyticsController.getProductivityOverview
);

/**
 * @route GET /api/v1/productivity-analytics/user/:userId
 * @desc Get individual user productivity analytics
 * @access Private
 */
router.get('/user/:userId', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_PRODUCTIVITY_REPORTS),
  productivityAnalyticsController.getUserProductivityAnalytics
);

/**
 * @route GET /api/v1/productivity-analytics/team
 * @desc Get team productivity analytics
 * @access Private
 */
router.get('/team', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_PRODUCTIVITY_REPORTS),
  productivityAnalyticsController.getTeamProductivityAnalytics
);

/**
 * @route GET /api/v1/productivity-analytics/efficiency
 * @desc Get efficiency metrics and trends
 * @access Private
 */
router.get('/efficiency', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_PRODUCTIVITY_REPORTS),
  productivityAnalyticsController.getEfficiencyMetrics
);

/**
 * @route GET /api/v1/productivity-analytics/benchmarking
 * @desc Get performance benchmarking data
 * @access Private
 */
router.get('/benchmarking', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_PRODUCTIVITY_REPORTS),
  productivityAnalyticsController.getPerformanceBenchmarking
);

export default router;