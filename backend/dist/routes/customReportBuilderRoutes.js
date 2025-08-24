"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const customReportBuilderController_1 = __importDefault(require("@/controllers/customReportBuilderController"));
const router = (0, express_1.Router)();
router.get('/data-sources', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.getDataSources);
router.post('/execute', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.executeCustomReport);
router.post('/templates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_REPORTS), customReportBuilderController_1.default.saveReportTemplate);
router.get('/templates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.getReportTemplates);
router.get('/templates/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.getReportTemplateById);
router.put('/templates/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_REPORTS), customReportBuilderController_1.default.updateReportTemplate);
router.delete('/templates/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_REPORTS), customReportBuilderController_1.default.deleteReportTemplate);
router.get('/pre-built-templates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.getPreBuiltTemplates);
router.post('/templates/:id/execute', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.executeReportFromTemplate);
router.post('/export', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.EXPORT_REPORTS), customReportBuilderController_1.default.exportReport);
router.get('/analytics', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_REPORTS), customReportBuilderController_1.default.getReportBuilderAnalytics);
exports.default = router;
//# sourceMappingURL=customReportBuilderRoutes.js.map