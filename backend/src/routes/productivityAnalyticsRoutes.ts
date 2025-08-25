/**
 * Productivity Analytics Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for productivity analytics and performance tracking
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getProductivityOverview,
  getUserProductivityAnalytics,
  getTeamProductivityAnalytics,
  getEfficiencyMetrics,
  getPerformanceBenchmarking
} from '@/controllers/productivityAnalyticsController';

const router = Router();

/**
 * @route GET /api/v1/productivity-analytics/overview
 * @desc Get productivity overview with key metrics
 * @access Private
 */
router.get('/overview', 
  authenticateToken, 
  getProductivityOverview
);

/**
 * @route GET /api/v1/productivity-analytics/user/:userId
 * @desc Get individual user productivity analytics
 * @access Private
 */
router.get('/user/:userId', 
  authenticateToken, 
  getUserProductivityAnalytics
);

/**
 * @route GET /api/v1/productivity-analytics/team
 * @desc Get team productivity analytics
 * @access Private
 */
router.get('/team', 
  authenticateToken, 
  getTeamProductivityAnalytics
);

/**
 * @route GET /api/v1/productivity-analytics/efficiency
 * @desc Get efficiency metrics and trends
 * @access Private
 */
router.get('/efficiency', 
  authenticateToken, 
  getEfficiencyMetrics
);

/**
 * @route GET /api/v1/productivity-analytics/benchmarking
 * @desc Get performance benchmarking data
 * @access Private
 */
router.get('/benchmarking', 
  authenticateToken, 
  getPerformanceBenchmarking
);

export default router;