/**
 * Custom Report Builder Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for custom report builder functionality including visual query building and report templates
 */

import { Request, Response } from 'express';
import { customReportBuilderService } from '@/services/customReportBuilderService';
import logger from '@/utils/logger';

/**
 * Get available data sources for report building
 * 
 * @route GET /api/v1/custom-report-builder/data-sources
 * @access Private
 */
export const getDataSources = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Getting data sources for report builder', { userId });

    const result = await customReportBuilderService.getDataSources();

    res.json(result);
  } catch (error) {
    logger.error('Error getting data sources', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATA_SOURCES_ERROR',
        message: 'Failed to get data sources'
      }
    });
  }
};

/**
 * Execute custom report
 * 
 * @route POST /api/v1/custom-report-builder/execute
 * @access Private
 */
export const executeCustomReport = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { queryDefinition, parameters } = req.body;

    logger.info('Executing custom report', { userId });

    const result = await customReportBuilderService.executeReport(queryDefinition, parameters);

    res.json(result);
  } catch (error) {
    logger.error('Error executing custom report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CUSTOM_REPORT_EXECUTION_ERROR',
        message: 'Failed to execute custom report'
      }
    });
  }
};

/**
 * Save custom report template
 * 
 * @route POST /api/v1/custom-report-builder/templates
 * @access Private
 */
export const saveReportTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const templateData = {
      ...req.body,
      createdBy: userId
    };

    logger.info('Saving custom report template', { userId, name: templateData.name });

    const result = await customReportBuilderService.saveReportTemplate(templateData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error saving report template', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_TEMPLATE_SAVE_ERROR',
        message: 'Failed to save report template'
      }
    });
  }
};

/**
 * Get custom report templates
 * 
 * @route GET /api/v1/custom-report-builder/templates
 * @access Private
 */
export const getReportTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Getting custom report templates', { userId });

    const result = await customReportBuilderService.getReportTemplates(userId);

    res.json(result);
  } catch (error) {
    logger.error('Error getting report templates', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_TEMPLATES_FETCH_ERROR',
        message: 'Failed to get report templates'
      }
    });
  }
};

/**
 * Get custom report template by ID
 * 
 * @route GET /api/v1/custom-report-builder/templates/:id
 * @access Private
 */
export const getReportTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

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

    logger.info('Getting custom report template by ID', { userId, templateId: id });

    const result = await customReportBuilderService.getReportTemplateById(id, userId);

    res.json(result);
  } catch (error) {
    logger.error('Error getting report template by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_TEMPLATE_FETCH_ERROR',
        message: 'Failed to get report template'
      }
    });
  }
};

/**
 * Update custom report template
 * 
 * @route PUT /api/v1/custom-report-builder/templates/:id
 * @access Private
 */
export const updateReportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
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

    logger.info('Updating custom report template', { userId, templateId: id });

    const result = await customReportBuilderService.updateReportTemplate(id, updates, userId);

    res.json(result);
  } catch (error) {
    logger.error('Error updating report template', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_TEMPLATE_UPDATE_ERROR',
        message: 'Failed to update report template'
      }
    });
  }
};

/**
 * Delete custom report template
 * 
 * @route DELETE /api/v1/custom-report-builder/templates/:id
 * @access Private
 */
export const deleteReportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

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

    logger.info('Deleting custom report template', { userId, templateId: id });

    const result = await customReportBuilderService.deleteReportTemplate(id, userId);

    res.json(result);
  } catch (error) {
    logger.error('Error deleting report template', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_TEMPLATE_DELETE_ERROR',
        message: 'Failed to delete report template'
      }
    });
  }
};

/**
 * Get pre-built report templates
 * 
 * @route GET /api/v1/custom-report-builder/pre-built-templates
 * @access Private
 */
export const getPreBuiltTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Getting pre-built report templates', { userId });

    const result = await customReportBuilderService.getPreBuiltTemplates();

    res.json(result);
  } catch (error) {
    logger.error('Error getting pre-built templates', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRE_BUILT_TEMPLATES_ERROR',
        message: 'Failed to get pre-built templates'
      }
    });
  }
};

/**
 * Execute report from template
 * 
 * @route POST /api/v1/custom-report-builder/templates/:id/execute
 * @access Private
 */
export const executeReportFromTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
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

    logger.info('Executing report from template', { userId, templateId: id });

    // Get template first
    const templateResult = await customReportBuilderService.getReportTemplateById(id, userId);
    const template = templateResult.data.template;

    // Execute the report using template's query definition
    const result = await customReportBuilderService.executeReport(
      template.query_definition,
      parameters || template.parameters || {}
    );

    res.json(result);
  } catch (error) {
    logger.error('Error executing report from template', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATE_EXECUTION_ERROR',
        message: 'Failed to execute report from template'
      }
    });
  }
};

/**
 * Export report to different formats
 * 
 * @route POST /api/v1/custom-report-builder/export
 * @access Private
 */
export const exportReport = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { queryDefinition, parameters, format = 'csv' } = req.body;

    logger.info('Exporting custom report', { userId, format });

    // Execute the report
    const result = await customReportBuilderService.executeReport(queryDefinition, parameters);
    const { rows, columns } = result.data;

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format.toLowerCase()) {
      case 'csv':
        // Convert to CSV
        const headers = columns.map((col: any) => col.label).join(',');
        const csvRows = rows.map((row: any) => 
          columns.map((col: any) => `"${row[col.name] || ''}"`).join(',')
        );
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

    // Set response headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(exportData, 'utf8'));

    res.send(exportData);

    logger.businessEvent('report_exported', 'custom_report', null, userId);
  } catch (error) {
    logger.error('Error exporting report', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_EXPORT_ERROR',
        message: 'Failed to export report'
      }
    });
  }
};

/**
 * Get report builder analytics
 * 
 * @route GET /api/v1/custom-report-builder/analytics
 * @access Private
 */
export const getReportBuilderAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Getting report builder analytics', { userId });

    // Get template usage statistics
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

    // Get recent template activity
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

    logger.info('Report builder analytics fetched successfully', { userId });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error getting report builder analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_BUILDER_ANALYTICS_ERROR',
        message: 'Failed to get report builder analytics'
      }
    });
  }
};

export default {
  getDataSources,
  executeCustomReport,
  saveReportTemplate,
  getReportTemplates,
  getReportTemplateById,
  updateReportTemplate,
  deleteReportTemplate,
  getPreBuiltTemplates,
  executeReportFromTemplate,
  exportReport,
  getReportBuilderAnalytics
};