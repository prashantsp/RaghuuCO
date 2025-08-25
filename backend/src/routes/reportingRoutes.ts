/**
 * Reporting Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for reporting and analytics functionality
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  executeReport,
  getReportExecutions,
  trackAnalyticsEvent,
  getAnalyticsSummary,
  recordPerformanceMetric,
  getPerformanceMetrics,
  recordBusinessMetric,
  getBusinessMetrics
} from '@/controllers/reportingController';

const router = Router();

/**
 * @route GET /api/v1/reporting/reports
 * @desc Get all reports with filtering and pagination
 * @access Private
 */
router.get('/reports', 
  authenticateToken, 
  getReports
);

/**
 * @route GET /api/v1/reporting/reports/:id
 * @desc Get report by ID
 * @access Private
 */
router.get('/reports/:id', 
  authenticateToken, 
  getReportById
);

/**
 * @route POST /api/v1/reporting/reports
 * @desc Create new report
 * @access Private
 */
router.post('/reports', 
  authenticateToken, 
  createReport
);

/**
 * @route PUT /api/v1/reporting/reports/:id
 * @desc Update report
 * @access Private
 */
router.put('/reports/:id', 
  authenticateToken, 
  updateReport
);

/**
 * @route DELETE /api/v1/reporting/reports/:id
 * @desc Delete report
 * @access Private
 */
router.delete('/reports/:id', 
  authenticateToken, 
  deleteReport
);

/**
 * @route POST /api/v1/reporting/reports/:id/execute
 * @desc Execute report
 * @access Private
 */
router.post('/reports/:id/execute', 
  authenticateToken, 
  executeReport
);

/**
 * @route GET /api/v1/reporting/reports/:id/executions
 * @desc Get report executions
 * @access Private
 */
router.get('/reports/:id/executions', 
  authenticateToken, 
  getReportExecutions
);

/**
 * @route POST /api/v1/reporting/analytics/events
 * @desc Track analytics event
 * @access Private
 */
router.post('/analytics/events', 
  authenticateToken, 
  trackAnalyticsEvent
);

/**
 * @route GET /api/v1/reporting/analytics/summary
 * @desc Get analytics summary
 * @access Private
 */
router.get('/analytics/summary', 
  authenticateToken, 
  getAnalyticsSummary
);

/**
 * @route POST /api/v1/reporting/performance/metrics
 * @desc Record performance metric
 * @access Private
 */
router.post('/performance/metrics', 
  authenticateToken, 
  recordPerformanceMetric
);

/**
 * @route GET /api/v1/reporting/performance/metrics
 * @desc Get performance metrics
 * @access Private
 */
router.get('/performance/metrics', 
  authenticateToken, 
  getPerformanceMetrics
);

/**
 * @route POST /api/v1/reporting/business/metrics
 * @desc Record business metric
 * @access Private
 */
router.post('/business/metrics', 
  authenticateToken, 
  recordBusinessMetric
);

/**
 * @route GET /api/v1/reporting/business/metrics
 * @desc Get business metrics
 * @access Private
 */
router.get('/business/metrics', 
  authenticateToken, 
  getBusinessMetrics
);

export default router;