"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const customReportBuilderController_1 = require("@/controllers/customReportBuilderController");
const router = (0, express_1.Router)();
router.get('/data-sources', auth_1.authenticateToken, customReportBuilderController_1.getDataSources);
router.post('/execute', auth_1.authenticateToken, customReportBuilderController_1.executeCustomReport);
router.post('/templates', auth_1.authenticateToken, customReportBuilderController_1.saveReportTemplate);
router.get('/templates', auth_1.authenticateToken, customReportBuilderController_1.getReportTemplates);
router.get('/templates/:id', auth_1.authenticateToken, customReportBuilderController_1.getReportTemplateById);
router.put('/templates/:id', auth_1.authenticateToken, customReportBuilderController_1.updateReportTemplate);
router.delete('/templates/:id', auth_1.authenticateToken, customReportBuilderController_1.deleteReportTemplate);
router.get('/pre-built-templates', auth_1.authenticateToken, customReportBuilderController_1.getPreBuiltTemplates);
router.post('/templates/:id/execute', auth_1.authenticateToken, customReportBuilderController_1.executeReportFromTemplate);
router.post('/export', auth_1.authenticateToken, customReportBuilderController_1.exportReport);
router.get('/analytics', auth_1.authenticateToken, customReportBuilderController_1.getReportBuilderAnalytics);
exports.default = router;
//# sourceMappingURL=customReportBuilderRoutes.js.map