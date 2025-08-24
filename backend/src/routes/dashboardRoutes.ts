/**
 * Dashboard Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for dashboard functionality
 */

import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import dashboardController from '@/controllers/dashboardController';

const router = express.Router();

/**
 * @route GET /api/v1/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

/**
 * @route GET /api/v1/dashboard/activities
 * @desc Get recent activities
 * @access Private
 */
router.get('/activities', authenticateToken, dashboardController.getRecentActivities);

/**
 * @route GET /api/v1/dashboard/summary
 * @desc Get dashboard summary
 * @access Private
 */
router.get('/summary', authenticateToken, dashboardController.getDashboardSummary);

export default router;