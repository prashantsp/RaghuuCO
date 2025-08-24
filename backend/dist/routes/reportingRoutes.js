"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const reportingController_1 = __importDefault(require("@/controllers/reportingController"));
const router = (0, express_1.Router)();
router.get('/reports', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.getReports);
router.get('/reports/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.getReportById);
router.post('/reports', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_EVENTS), reportingController_1.default.createReport);
router.put('/reports/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_EVENTS), reportingController_1.default.updateReport);
router.delete('/reports/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_EVENTS), reportingController_1.default.deleteReport);
router.post('/reports/:id/execute', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_EVENTS), reportingController_1.default.executeReport);
router.get('/reports/:id/executions', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.getReportExecutions);
router.post('/analytics/events', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.trackAnalyticsEvent);
router.get('/analytics/summary', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.getAnalyticsSummary);
router.post('/performance/metrics', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.recordPerformanceMetric);
router.get('/performance/metrics', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.getPerformanceMetrics);
router.post('/business/metrics', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.recordBusinessMetric);
router.get('/business/metrics', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), reportingController_1.default.getBusinessMetrics);
exports.default = router;
//# sourceMappingURL=reportingRoutes.js.map