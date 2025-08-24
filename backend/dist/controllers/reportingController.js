"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessMetrics = exports.recordBusinessMetric = exports.getPerformanceMetrics = exports.recordPerformanceMetric = exports.getAnalyticsSummary = exports.trackAnalyticsEvent = exports.getReportExecutions = exports.executeReport = exports.deleteReport = exports.updateReport = exports.createReport = exports.getReportById = exports.getReports = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const reportExecutionService_1 = require("@/services/reportExecutionService");
const logger_1 = __importDefault(require("@/utils/logger"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.default();
const getReports = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, search, reportType, isActive } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching reports', { userId, filters: req.query });
        const result = await db.query(db_SQLQueries_1.SQLQueries.REPORTS.SEARCH, [
            search || null,
            reportType || null,
            isActive !== undefined ? isActive : null,
            parseInt(limit),
            offset
        ]);
        const reports = result.rows;
        logger_1.default.info('Reports fetched successfully', { userId, count: reports.length });
        res.json({
            success: true,
            data: { reports }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching reports', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORTS_FETCH_ERROR',
                message: 'Failed to fetch reports'
            }
        });
    }
};
exports.getReports = getReports;
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Fetching report by ID', { userId, reportId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.REPORTS.GET_BY_ID, [id]);
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
        logger_1.default.info('Report fetched successfully', { userId, reportId: id });
        res.json({
            success: true,
            data: { report }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_FETCH_ERROR',
                message: 'Failed to fetch report'
            }
        });
    }
};
exports.getReportById = getReportById;
const createReport = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, description, reportType, parameters, scheduleCron } = req.body;
        logger_1.default.info('Creating new report', { userId, name, reportType });
        const result = await db.query(db_SQLQueries_1.SQLQueries.REPORTS.CREATE, [
            name,
            description,
            reportType,
            parameters || {},
            scheduleCron || null,
            userId
        ]);
        const report = result.rows[0];
        logger_1.default.businessEvent('report_created', 'report', report.id, userId);
        res.status(201).json({
            success: true,
            data: { report }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_CREATE_ERROR',
                message: 'Failed to create report'
            }
        });
    }
};
exports.createReport = createReport;
const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { name, description, reportType, parameters, scheduleCron, isActive } = req.body;
        logger_1.default.info('Updating report', { userId, reportId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.REPORTS.UPDATE, [
            id,
            name,
            description,
            reportType,
            parameters || {},
            scheduleCron || null,
            isActive !== undefined ? isActive : true
        ]);
        const report = result.rows[0];
        logger_1.default.businessEvent('report_updated', 'report', id, userId);
        res.json({
            success: true,
            data: { report }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_UPDATE_ERROR',
                message: 'Failed to update report'
            }
        });
    }
};
exports.updateReport = updateReport;
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Deleting report', { userId, reportId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.REPORTS.GET_BY_ID, [id]);
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
        await db.query(db_SQLQueries_1.SQLQueries.REPORTS.DELETE, [id]);
        logger_1.default.businessEvent('report_deleted', 'report', id, userId);
        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_DELETE_ERROR',
                message: 'Failed to delete report'
            }
        });
    }
};
exports.deleteReport = deleteReport;
const executeReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { parameters } = req.body;
        logger_1.default.info('Executing report', { userId, reportId: id });
        const reportResult = await db.query(db_SQLQueries_1.SQLQueries.REPORTS.GET_BY_ID, [id]);
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
        const executionResult = await db.query(db_SQLQueries_1.SQLQueries.REPORT_EXECUTIONS.CREATE, [
            id,
            userId,
            'running',
            parameters || {}
        ]);
        const execution = executionResult.rows[0];
        const reportResult = await reportExecutionService_1.reportExecutionService.executeReport(id, parameters || [], userId);
        logger_1.default.businessEvent('report_executed', 'report_execution', execution.id, userId);
        logger_1.default.businessEvent('report_executed', 'report_execution', execution.id, userId);
        res.json({
            success: true,
            data: {
                execution: reportResult,
                message: 'Report execution completed successfully'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error executing report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_EXECUTION_ERROR',
                message: 'Failed to execute report'
            }
        });
    }
};
exports.executeReport = executeReport;
const getReportExecutions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching report executions', { userId, reportId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.REPORT_EXECUTIONS.SEARCH, [
            null,
            null,
            id,
            parseInt(limit),
            offset
        ]);
        const executions = result.rows;
        logger_1.default.info('Report executions fetched successfully', { userId, reportId: id, count: executions.length });
        res.json({
            success: true,
            data: { executions }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching report executions', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_EXECUTIONS_FETCH_ERROR',
                message: 'Failed to fetch report executions'
            }
        });
    }
};
exports.getReportExecutions = getReportExecutions;
const trackAnalyticsEvent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { eventType, sessionId, pageUrl, referrerUrl, userAgent, ipAddress, eventData } = req.body;
        logger_1.default.info('Tracking analytics event', { userId, eventType, pageUrl });
        const result = await db.query(db_SQLQueries_1.SQLQueries.ANALYTICS_EVENTS.CREATE, [
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
    }
    catch (error) {
        logger_1.default.error('Error tracking analytics event', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ANALYTICS_EVENT_TRACKING_ERROR',
                message: 'Failed to track analytics event'
            }
        });
    }
};
exports.trackAnalyticsEvent = trackAnalyticsEvent;
const getAnalyticsSummary = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate } = req.query;
        logger_1.default.info('Fetching analytics summary', { userId, startDate, endDate });
        const pageViewsResult = await db.query(db_SQLQueries_1.SQLQueries.ANALYTICS_EVENTS.GET_PAGE_VIEWS, [
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date()
        ]);
        const userActivityResult = await db.query(db_SQLQueries_1.SQLQueries.ANALYTICS_EVENTS.GET_USER_ACTIVITY, [
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date()
        ]);
        const summary = {
            pageViews: pageViewsResult.rows,
            userActivity: userActivityResult.rows,
            totalEvents: userActivityResult.rows.reduce((sum, user) => sum + parseInt(user.event_count), 0),
            activeUsers: userActivityResult.rows.length
        };
        logger_1.default.info('Analytics summary fetched successfully', { userId });
        res.json({
            success: true,
            data: { summary }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching analytics summary', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ANALYTICS_SUMMARY_FETCH_ERROR',
                message: 'Failed to fetch analytics summary'
            }
        });
    }
};
exports.getAnalyticsSummary = getAnalyticsSummary;
const recordPerformanceMetric = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { metricName, metricValue, metricUnit, tags } = req.body;
        logger_1.default.info('Recording performance metric', { userId, metricName, metricValue });
        const result = await db.query(db_SQLQueries_1.SQLQueries.PERFORMANCE_METRICS.CREATE, [
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
    }
    catch (error) {
        logger_1.default.error('Error recording performance metric', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PERFORMANCE_METRIC_RECORDING_ERROR',
                message: 'Failed to record performance metric'
            }
        });
    }
};
exports.recordPerformanceMetric = recordPerformanceMetric;
const getPerformanceMetrics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { metricName, startDate, endDate } = req.query;
        logger_1.default.info('Fetching performance metrics', { userId, metricName, startDate, endDate });
        let result;
        if (metricName) {
            result = await db.query(db_SQLQueries_1.SQLQueries.PERFORMANCE_METRICS.GET_BY_NAME, [
                metricName,
                startDate || new Date(Date.now() - 24 * 60 * 60 * 1000),
                endDate || new Date()
            ]);
        }
        else {
            result = await db.query(db_SQLQueries_1.SQLQueries.PERFORMANCE_METRICS.GET_METRICS_SUMMARY, [
                startDate || new Date(Date.now() - 24 * 60 * 60 * 1000),
                endDate || new Date()
            ]);
        }
        const metrics = result.rows;
        logger_1.default.info('Performance metrics fetched successfully', { userId, count: metrics.length });
        res.json({
            success: true,
            data: { metrics }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching performance metrics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PERFORMANCE_METRICS_FETCH_ERROR',
                message: 'Failed to fetch performance metrics'
            }
        });
    }
};
exports.getPerformanceMetrics = getPerformanceMetrics;
const recordBusinessMetric = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { metricDate, metricType, metricValue, metricCount, additionalData } = req.body;
        logger_1.default.info('Recording business metric', { userId, metricType, metricValue });
        const result = await db.query(db_SQLQueries_1.SQLQueries.BUSINESS_METRICS.CREATE, [
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
    }
    catch (error) {
        logger_1.default.error('Error recording business metric', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'BUSINESS_METRIC_RECORDING_ERROR',
                message: 'Failed to record business metric'
            }
        });
    }
};
exports.recordBusinessMetric = recordBusinessMetric;
const getBusinessMetrics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { metricType, startDate, endDate } = req.query;
        logger_1.default.info('Fetching business metrics', { userId, metricType, startDate, endDate });
        let result;
        if (metricType) {
            result = await db.query(db_SQLQueries_1.SQLQueries.BUSINESS_METRICS.GET_BY_TYPE, [
                metricType,
                startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate || new Date()
            ]);
        }
        else {
            result = await db.query(db_SQLQueries_1.SQLQueries.BUSINESS_METRICS.GET_DAILY_SUMMARY, [
                startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate || new Date()
            ]);
        }
        const metrics = result.rows;
        logger_1.default.info('Business metrics fetched successfully', { userId, count: metrics.length });
        res.json({
            success: true,
            data: { metrics }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching business metrics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'BUSINESS_METRICS_FETCH_ERROR',
                message: 'Failed to fetch business metrics'
            }
        });
    }
};
exports.getBusinessMetrics = getBusinessMetrics;
exports.default = {
    getReports: exports.getReports,
    getReportById: exports.getReportById,
    createReport: exports.createReport,
    updateReport: exports.updateReport,
    deleteReport: exports.deleteReport,
    executeReport: exports.executeReport,
    getReportExecutions: exports.getReportExecutions,
    trackAnalyticsEvent: exports.trackAnalyticsEvent,
    getAnalyticsSummary: exports.getAnalyticsSummary,
    recordPerformanceMetric: exports.recordPerformanceMetric,
    getPerformanceMetrics: exports.getPerformanceMetrics,
    recordBusinessMetric: exports.recordBusinessMetric,
    getBusinessMetrics: exports.getBusinessMetrics
};
//# sourceMappingURL=reportingController.js.map