/**
 * Reporting Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for reporting and analytics management including custom reports, analytics events, and business metrics
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import { authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import { reportExecutionService } from '@/services/reportExecutionService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Get all reports with filtering and pagination
 * 
 * @route GET /api/v1/reporting/reports
 * @access Private
 */
export const getReports = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { 
      page = 1, 
      limit = 20, 
      search, 
      reportType, 
      isActive 
    } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching reports', { userId, filters: req.query });

    const result = await db.query(SQLQueries.REPORTS.SEARCH, [
      search || null,
      reportType || null,
      isActive !== undefined ? isActive : null,
      parseInt(limit as string),
      offset
    ]);

    const reports = result.rows;

    logger.info('Reports fetched successfully', { userId, count: reports.length });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    logger.error('Error fetching reports', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORTS_FETCH_ERROR',
        message: 'Failed to fetch reports'
      }
    });
  }
};

/**
 * Get report by ID
 * 
 * @route GET /api/v1/reporting/reports/:id
 * @access Private
 */
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Fetching report by ID', { userId, reportId: id });

    const result = await db.query(SQLQueries.REPORTS.GET_BY_ID, [id]);
    const report = result.rows[0];

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    logger.info('Report fetched successfully', { userId, reportId: id });

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    logger.error('Error fetching report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_FETCH_ERROR',
        message: 'Failed to fetch report'
      }
    });
  }
};

/**
 * Create new report
 * 
 * @route POST /api/v1/reporting/reports
 * @access Private
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      name,
      description,
      reportType,
      parameters,
      scheduleCron
    } = req.body;

    logger.info('Creating new report', { userId, name, reportType });

    const result = await db.query(SQLQueries.REPORTS.CREATE, [
      name,
      description,
      reportType,
      parameters || {},
      scheduleCron || null,
      userId
    ]);

    const report = result.rows[0];

    logger.businessEvent('report_created', 'report', report.id, userId);

    res.status(201).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    logger.error('Error creating report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_CREATE_ERROR',
        message: 'Failed to create report'
      }
    });
  }
};

/**
 * Update report
 * 
 * @route PUT /api/v1/reporting/reports/:id
 * @access Private
 */
export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      name,
      description,
      reportType,
      parameters,
      scheduleCron,
      isActive
    } = req.body;

    logger.info('Updating report', { userId, reportId: id });

    const result = await db.query(SQLQueries.REPORTS.UPDATE, [
      id,
      name,
      description,
      reportType,
      parameters || {},
      scheduleCron || null,
      isActive !== undefined ? isActive : true
    ]);

    const report = result.rows[0];

    logger.businessEvent('report_updated', 'report', id, userId);

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    logger.error('Error updating report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_UPDATE_ERROR',
        message: 'Failed to update report'
      }
    });
  }
};

/**
 * Delete report
 * 
 * @route DELETE /api/v1/reporting/reports/:id
 * @access Private
 */
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Deleting report', { userId, reportId: id });

    // Check if report exists
    const currentResult = await db.query(SQLQueries.REPORTS.GET_BY_ID, [id]);
    const report = currentResult.rows[0];

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    // Delete report
    await db.query(SQLQueries.REPORTS.DELETE, [id]);

    logger.businessEvent('report_deleted', 'report', id, userId);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_DELETE_ERROR',
        message: 'Failed to delete report'
      }
    });
  }
};

/**
 * Execute report
 * 
 * @route POST /api/v1/reporting/reports/:id/execute
 * @access Private
 */
export const executeReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const { parameters } = req.body;

    logger.info('Executing report', { userId, reportId: id });

    // Check if report exists
    const reportResult = await db.query(SQLQueries.REPORTS.GET_BY_ID, [id]);
    const report = reportResult.rows[0];

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    // Create execution record
    const executionResult = await db.query(SQLQueries.REPORT_EXECUTIONS.CREATE, [
      id,
      userId,
      'running',
      parameters || {}
    ]);

    const execution = executionResult.rows[0];

    // Execute report using the report execution service
    const reportResult = await reportExecutionService.executeReport(
      id,
      parameters || [],
      userId
    );

    logger.businessEvent('report_executed', 'report_execution', execution.id, userId);

    logger.businessEvent('report_executed', 'report_execution', execution.id, userId);

    res.json({
      success: true,
      data: { 
        execution: reportResult,
        message: 'Report execution completed successfully'
      }
    });
  } catch (error) {
    logger.error('Error executing report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_EXECUTION_ERROR',
        message: 'Failed to execute report'
      }
    });
  }
};

/**
 * Get report executions
 * 
 * @route GET /api/v1/reporting/reports/:id/executions
 * @access Private
 */
export const getReportExecutions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching report executions', { userId, reportId: id });

    const result = await db.query(SQLQueries.REPORT_EXECUTIONS.SEARCH, [
      null, // status filter
      null, // executed_by filter
      id,   // report_id filter
      parseInt(limit as string),
      offset
    ]);

    const executions = result.rows;

    logger.info('Report executions fetched successfully', { userId, reportId: id, count: executions.length });

    res.json({
      success: true,
      data: { executions }
    });
  } catch (error) {
    logger.error('Error fetching report executions', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_EXECUTIONS_FETCH_ERROR',
        message: 'Failed to fetch report executions'
      }
    });
  }
};

/**
 * Track analytics event
 * 
 * @route POST /api/v1/reporting/analytics/events
 * @access Private
 */
export const trackAnalyticsEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      eventType,
      sessionId,
      pageUrl,
      referrerUrl,
      userAgent,
      ipAddress,
      eventData
    } = req.body;

    logger.info('Tracking analytics event', { userId, eventType, pageUrl });

    const result = await db.query(SQLQueries.ANALYTICS_EVENTS.CREATE, [
      eventType,
      userId,
      sessionId,
      pageUrl,
      referrerUrl,
      userAgent,
      ipAddress,
      eventData || {}
    ]);

    const event = result.rows[0];

    res.status(201).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    logger.error('Error tracking analytics event', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_EVENT_TRACKING_ERROR',
        message: 'Failed to track analytics event'
      }
    });
  }
};

/**
 * Get analytics summary
 * 
 * @route GET /api/v1/reporting/analytics/summary
 * @access Private
 */
export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { startDate, endDate } = req.query;

    logger.info('Fetching analytics summary', { userId, startDate, endDate });

    // Get page views
    const pageViewsResult = await db.query(SQLQueries.ANALYTICS_EVENTS.GET_PAGE_VIEWS, [
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate || new Date()
    ]);

    // Get user activity
    const userActivityResult = await db.query(SQLQueries.ANALYTICS_EVENTS.GET_USER_ACTIVITY, [
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate || new Date()
    ]);

    const summary = {
      pageViews: pageViewsResult.rows,
      userActivity: userActivityResult.rows,
      totalEvents: userActivityResult.rows.reduce((sum, user) => sum + parseInt(user.event_count), 0),
      activeUsers: userActivityResult.rows.length
    };

    logger.info('Analytics summary fetched successfully', { userId });

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    logger.error('Error fetching analytics summary', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_SUMMARY_FETCH_ERROR',
        message: 'Failed to fetch analytics summary'
      }
    });
  }
};

/**
 * Record performance metric
 * 
 * @route POST /api/v1/reporting/performance/metrics
 * @access Private
 */
export const recordPerformanceMetric = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      metricName,
      metricValue,
      metricUnit,
      tags
    } = req.body;

    logger.info('Recording performance metric', { userId, metricName, metricValue });

    const result = await db.query(SQLQueries.PERFORMANCE_METRICS.CREATE, [
      metricName,
      metricValue,
      metricUnit,
      tags || {}
    ]);

    const metric = result.rows[0];

    res.status(201).json({
      success: true,
      data: { metric }
    });
  } catch (error) {
    logger.error('Error recording performance metric', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERFORMANCE_METRIC_RECORDING_ERROR',
        message: 'Failed to record performance metric'
      }
    });
  }
};

/**
 * Get performance metrics
 * 
 * @route GET /api/v1/reporting/performance/metrics
 * @access Private
 */
export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { metricName, startDate, endDate } = req.query;

    logger.info('Fetching performance metrics', { userId, metricName, startDate, endDate });

    let result;
    if (metricName) {
      result = await db.query(SQLQueries.PERFORMANCE_METRICS.GET_BY_NAME, [
        metricName,
        startDate || new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        endDate || new Date()
      ]);
    } else {
      result = await db.query(SQLQueries.PERFORMANCE_METRICS.GET_METRICS_SUMMARY, [
        startDate || new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate || new Date()
      ]);
    }

    const metrics = result.rows;

    logger.info('Performance metrics fetched successfully', { userId, count: metrics.length });

    res.json({
      success: true,
      data: { metrics }
    });
  } catch (error) {
    logger.error('Error fetching performance metrics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERFORMANCE_METRICS_FETCH_ERROR',
        message: 'Failed to fetch performance metrics'
      }
    });
  }
};

/**
 * Record business metric
 * 
 * @route POST /api/v1/reporting/business/metrics
 * @access Private
 */
export const recordBusinessMetric = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      metricDate,
      metricType,
      metricValue,
      metricCount,
      additionalData
    } = req.body;

    logger.info('Recording business metric', { userId, metricType, metricValue });

    const result = await db.query(SQLQueries.BUSINESS_METRICS.CREATE, [
      metricDate || new Date(),
      metricType,
      metricValue,
      metricCount || 0,
      additionalData || {}
    ]);

    const metric = result.rows[0];

    res.status(201).json({
      success: true,
      data: { metric }
    });
  } catch (error) {
    logger.error('Error recording business metric', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BUSINESS_METRIC_RECORDING_ERROR',
        message: 'Failed to record business metric'
      }
    });
  }
};

/**
 * Get business metrics
 * 
 * @route GET /api/v1/reporting/business/metrics
 * @access Private
 */
export const getBusinessMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { metricType, startDate, endDate } = req.query;

    logger.info('Fetching business metrics', { userId, metricType, startDate, endDate });

    let result;
    if (metricType) {
      result = await db.query(SQLQueries.BUSINESS_METRICS.GET_BY_TYPE, [
        metricType,
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate || new Date()
      ]);
    } else {
      result = await db.query(SQLQueries.BUSINESS_METRICS.GET_DAILY_SUMMARY, [
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate || new Date()
      ]);
    }

    const metrics = result.rows;

    logger.info('Business metrics fetched successfully', { userId, count: metrics.length });

    res.json({
      success: true,
      data: { metrics }
    });
  } catch (error) {
    logger.error('Error fetching business metrics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BUSINESS_METRICS_FETCH_ERROR',
        message: 'Failed to fetch business metrics'
      }
    });
  }
};

export default {
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
};