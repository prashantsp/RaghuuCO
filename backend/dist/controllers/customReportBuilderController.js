"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportBuilderAnalytics = exports.exportReport = exports.executeReportFromTemplate = exports.getPreBuiltTemplates = exports.deleteReportTemplate = exports.updateReportTemplate = exports.getReportTemplateById = exports.getReportTemplates = exports.saveReportTemplate = exports.executeCustomReport = exports.getDataSources = void 0;
const customReportBuilderService_1 = require("@/services/customReportBuilderService");
const logger_1 = __importDefault(require("@/utils/logger"));
const getDataSources = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Getting data sources for report builder', { userId });
        const result = await customReportBuilderService_1.customReportBuilderService.getDataSources();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting data sources', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DATA_SOURCES_ERROR',
                message: 'Failed to get data sources'
            }
        });
    }
};
exports.getDataSources = getDataSources;
const executeCustomReport = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { queryDefinition, parameters } = req.body;
        logger_1.default.info('Executing custom report', { userId });
        const result = await customReportBuilderService_1.customReportBuilderService.executeReport(queryDefinition, parameters);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error executing custom report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CUSTOM_REPORT_EXECUTION_ERROR',
                message: 'Failed to execute custom report'
            }
        });
    }
};
exports.executeCustomReport = executeCustomReport;
const saveReportTemplate = async (req, res) => {
    try {
        const userId = req.user?.id;
        const templateData = {
            ...req.body,
            createdBy: userId
        };
        logger_1.default.info('Saving custom report template', { userId, name: templateData.name });
        const result = await customReportBuilderService_1.customReportBuilderService.saveReportTemplate(templateData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error saving report template', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_TEMPLATE_SAVE_ERROR',
                message: 'Failed to save report template'
            }
        });
    }
};
exports.saveReportTemplate = saveReportTemplate;
const getReportTemplates = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Getting custom report templates', { userId });
        const result = await customReportBuilderService_1.customReportBuilderService.getReportTemplates(userId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting report templates', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_TEMPLATES_FETCH_ERROR',
                message: 'Failed to get report templates'
            }
        });
    }
};
exports.getReportTemplates = getReportTemplates;
const getReportTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TEMPLATE_ID',
                    message: 'Template ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Getting custom report template by ID', { userId, templateId: id });
        const result = await customReportBuilderService_1.customReportBuilderService.getReportTemplateById(id, userId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting report template by ID', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_TEMPLATE_FETCH_ERROR',
                message: 'Failed to get report template'
            }
        });
    }
};
exports.getReportTemplateById = getReportTemplateById;
const updateReportTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updates = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TEMPLATE_ID',
                    message: 'Template ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Updating custom report template', { userId, templateId: id });
        const result = await customReportBuilderService_1.customReportBuilderService.updateReportTemplate(id, updates, userId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error updating report template', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_TEMPLATE_UPDATE_ERROR',
                message: 'Failed to update report template'
            }
        });
    }
};
exports.updateReportTemplate = updateReportTemplate;
const deleteReportTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TEMPLATE_ID',
                    message: 'Template ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Deleting custom report template', { userId, templateId: id });
        const result = await customReportBuilderService_1.customReportBuilderService.deleteReportTemplate(id, userId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error deleting report template', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_TEMPLATE_DELETE_ERROR',
                message: 'Failed to delete report template'
            }
        });
    }
};
exports.deleteReportTemplate = deleteReportTemplate;
const getPreBuiltTemplates = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Getting pre-built report templates', { userId });
        const result = await customReportBuilderService_1.customReportBuilderService.getPreBuiltTemplates();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting pre-built templates', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PRE_BUILT_TEMPLATES_ERROR',
                message: 'Failed to get pre-built templates'
            }
        });
    }
};
exports.getPreBuiltTemplates = getPreBuiltTemplates;
const executeReportFromTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { parameters } = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TEMPLATE_ID',
                    message: 'Template ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Executing report from template', { userId, templateId: id });
        const templateResult = await customReportBuilderService_1.customReportBuilderService.getReportTemplateById(id, userId);
        const template = templateResult.data.template;
        const result = await customReportBuilderService_1.customReportBuilderService.executeReport(template.query_definition, parameters || template.parameters || {});
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error executing report from template', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TEMPLATE_EXECUTION_ERROR',
                message: 'Failed to execute report from template'
            }
        });
    }
};
exports.executeReportFromTemplate = executeReportFromTemplate;
const exportReport = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { queryDefinition, parameters, format = 'csv' } = req.body;
        logger_1.default.info('Exporting custom report', { userId, format });
        const result = await customReportBuilderService_1.customReportBuilderService.executeReport(queryDefinition, parameters);
        const { rows, columns } = result.data;
        let exportData;
        let contentType;
        let filename;
        switch (format.toLowerCase()) {
            case 'csv':
                const headers = columns.map((col) => col.label).join(',');
                const csvRows = rows.map((row) => columns.map((col) => `"${row[col.name] || ''}"`).join(','));
                exportData = [headers, ...csvRows].join('\n');
                contentType = 'text/csv';
                filename = `report_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'json':
                exportData = JSON.stringify({ columns, rows }, null, 2);
                contentType = 'application/json';
                filename = `report_${new Date().toISOString().split('T')[0]}.json`;
                break;
            default:
                throw new Error('Unsupported export format');
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(exportData, 'utf8'));
        res.send(exportData);
        logger_1.default.businessEvent('report_exported', 'custom_report', null, userId);
    }
    catch (error) {
        logger_1.default.error('Error exporting report', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_EXPORT_ERROR',
                message: 'Failed to export report'
            }
        });
    }
};
exports.exportReport = exportReport;
const getReportBuilderAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Getting report builder analytics', { userId });
        const templateUsageResult = await db.query(`
      SELECT 
        template_type,
        COUNT(*) as template_count,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_templates,
        COUNT(CASE WHEN is_public = false THEN 1 END) as private_templates
      FROM custom_report_templates
      WHERE created_by = $1 OR is_public = true
      GROUP BY template_type
    `, [userId]);
        const recentActivityResult = await db.query(`
      SELECT 
        crt.name,
        crt.template_type,
        crt.created_at,
        u.first_name,
        u.last_name
      FROM custom_report_templates crt
      LEFT JOIN users u ON crt.created_by = u.id
      WHERE crt.created_by = $1 OR crt.is_public = true
      ORDER BY crt.created_at DESC
      LIMIT 10
    `, [userId]);
        const analytics = {
            templateUsage: templateUsageResult.rows,
            recentActivity: recentActivityResult.rows
        };
        logger_1.default.info('Report builder analytics fetched successfully', { userId });
        res.json({
            success: true,
            data: { analytics }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting report builder analytics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REPORT_BUILDER_ANALYTICS_ERROR',
                message: 'Failed to get report builder analytics'
            }
        });
    }
};
exports.getReportBuilderAnalytics = getReportBuilderAnalytics;
exports.default = {
    getDataSources: exports.getDataSources,
    executeCustomReport: exports.executeCustomReport,
    saveReportTemplate: exports.saveReportTemplate,
    getReportTemplates: exports.getReportTemplates,
    getReportTemplateById: exports.getReportTemplateById,
    updateReportTemplate: exports.updateReportTemplate,
    deleteReportTemplate: exports.deleteReportTemplate,
    getPreBuiltTemplates: exports.getPreBuiltTemplates,
    executeReportFromTemplate: exports.executeReportFromTemplate,
    exportReport: exports.exportReport,
    getReportBuilderAnalytics: exports.getReportBuilderAnalytics
};
//# sourceMappingURL=customReportBuilderController.js.map