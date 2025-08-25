/**
 * Custom Report Builder Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for custom report builder functionality including visual query building and report templates
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import {
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
} from '@/controllers/customReportBuilderController';

const router = Router();

/**
 * @route GET /api/v1/custom-report-builder/data-sources
 * @desc Get available data sources for report building
 * @access Private
 */
router.get('/data-sources', 
  authenticateToken, 
  getDataSources
);

/**
 * @route POST /api/v1/custom-report-builder/execute
 * @desc Execute custom report query
 * @access Private
 */
router.post('/execute', 
  authenticateToken, 
  executeCustomReport
);

/**
 * @route POST /api/v1/custom-report-builder/templates
 * @desc Save custom report template
 * @access Private
 */
router.post('/templates', 
  authenticateToken, 
  saveReportTemplate
);

/**
 * @route GET /api/v1/custom-report-builder/templates
 * @desc Get custom report templates
 * @access Private
 */
router.get('/templates', 
  authenticateToken, 
  getReportTemplates
);

/**
 * @route GET /api/v1/custom-report-builder/templates/:id
 * @desc Get custom report template by ID
 * @access Private
 */
router.get('/templates/:id', 
  authenticateToken, 
  getReportTemplateById
);

/**
 * @route PUT /api/v1/custom-report-builder/templates/:id
 * @desc Update custom report template
 * @access Private
 */
router.put('/templates/:id', 
  authenticateToken, 
  updateReportTemplate
);

/**
 * @route DELETE /api/v1/custom-report-builder/templates/:id
 * @desc Delete custom report template
 * @access Private
 */
router.delete('/templates/:id', 
  authenticateToken, 
  deleteReportTemplate
);

/**
 * @route GET /api/v1/custom-report-builder/pre-built-templates
 * @desc Get pre-built report templates
 * @access Private
 */
router.get('/pre-built-templates', 
  authenticateToken, 
  getPreBuiltTemplates
);

/**
 * @route POST /api/v1/custom-report-builder/templates/:id/execute
 * @desc Execute report from template
 * @access Private
 */
router.post('/templates/:id/execute', 
  authenticateToken, 
  executeReportFromTemplate
);

/**
 * @route POST /api/v1/custom-report-builder/export
 * @desc Export report to different formats
 * @access Private
 */
router.post('/export', 
  authenticateToken, 
  exportReport
);

/**
 * @route GET /api/v1/custom-report-builder/analytics
 * @desc Get report builder analytics
 * @access Private
 */
router.get('/analytics', 
  authenticateToken, 
  getReportBuilderAnalytics
);

export default router;