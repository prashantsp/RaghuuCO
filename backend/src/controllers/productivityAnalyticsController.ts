/**
 * Productivity Analytics Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for productivity analytics and performance tracking
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Get productivity overview
 * 
 * @route GET /api/v1/productivity-analytics/overview
 * @access Private
 */
export const getProductivityOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Getting productivity overview', { userId });

    // Get current month productivity metrics
    const currentMonthResult = await db.query(`
      SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0) as billable_minutes,
        COUNT(*) as total_entries,
        COUNT(DISTINCT user_id) as active_users
      FROM time_entries 
      WHERE DATE_TRUNC('month', start_time) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Get task completion metrics
    const taskCompletionResult = await db.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Get case productivity metrics
    const caseProductivityResult = await db.query(`
      SELECT 
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_cases,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cases,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_case_duration_days
      FROM cases 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Get top performers
    const topPerformersResult = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        COALESCE(SUM(te.duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0) as billable_minutes,
        COUNT(DISTINCT t.id) as tasks_completed
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND DATE_TRUNC('month', te.start_time) = DATE_TRUNC('month', CURRENT_DATE)
      LEFT JOIN tasks t ON u.id = t.assigned_to 
        AND t.status = 'completed' 
        AND DATE_TRUNC('month', t.completed_date) = DATE_TRUNC('month', CURRENT_DATE)
      WHERE u.role IN ('partner', 'senior_associate', 'junior_associate', 'paralegal')
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY billable_minutes DESC
      LIMIT 5
    `);

    const overview = {
      currentMonth: currentMonthResult[0],
      taskCompletion: taskCompletionResult[0],
      caseProductivity: caseProductivityResult[0],
              topPerformers: topPerformersResult
    };

    logger.info('Productivity overview fetched successfully', { userId });

    res.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    logger.error('Error getting productivity overview', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRODUCTIVITY_OVERVIEW_ERROR',
        message: 'Failed to get productivity overview'
      }
    });
  }
};

/**
 * Get individual user productivity analytics
 * 
 * @route GET /api/v1/productivity-analytics/user/:userId
 * @access Private
 */
export const getUserProductivityAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = '30' } = req.query;

    logger.info('Getting user productivity analytics', { userId, period });

    // Get user time tracking data
    const timeTrackingResult = await db.query(`
      SELECT 
        DATE_TRUNC('day', start_time) as date,
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0) as billable_minutes,
        COUNT(*) as entries_count
      FROM time_entries 
      WHERE user_id = $1 
      AND start_time >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('day', start_time)
      ORDER BY date DESC
    `, [userId]);

    // Get task completion data
    const taskCompletionResult = await db.query(`
      SELECT 
        DATE_TRUNC('day', completed_date) as date,
        COUNT(*) as tasks_completed,
        AVG(EXTRACT(EPOCH FROM (completed_date - created_at))/3600) as avg_completion_hours
      FROM tasks 
      WHERE assigned_to = $1 
      AND status = 'completed'
      AND completed_date >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('day', completed_date)
      ORDER BY date DESC
    `, [userId]);

    // Get case productivity data
    const caseProductivityResult = await db.query(`
      SELECT 
        c.case_number,
        c.title,
        c.status,
        c.created_at,
        c.updated_at,
        COALESCE(SUM(te.duration_minutes), 0) as total_time_minutes,
        COUNT(DISTINCT t.id) as tasks_count,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks
      FROM cases c
      LEFT JOIN time_entries te ON c.id = te.case_id AND te.user_id = $1
      LEFT JOIN tasks t ON c.id = t.case_id AND t.assigned_to = $1
      WHERE c.assigned_to = $1
      AND c.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY c.id, c.case_number, c.title, c.status, c.created_at, c.updated_at
      ORDER BY c.updated_at DESC
    `, [userId]);

    // Get productivity summary
    const productivitySummaryResult = await db.query(`
      SELECT 
        COALESCE(SUM(te.duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0) as billable_minutes,
        COUNT(DISTINCT te.id) as time_entries,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
        COUNT(DISTINCT c.id) as total_cases,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'completed') as completed_cases
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.start_time >= CURRENT_DATE - INTERVAL '${period} days'
      LEFT JOIN tasks t ON u.id = t.assigned_to 
        AND t.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      LEFT JOIN cases c ON u.id = c.assigned_to 
        AND c.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      WHERE u.id = $1
    `, [userId]);

    const analytics = {
              timeTracking: timeTrackingResult,
        taskCompletion: taskCompletionResult,
        caseProductivity: caseProductivityResult,
              summary: productivitySummaryResult[0]
    };

    logger.info('User productivity analytics fetched successfully', { userId });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error getting user productivity analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_PRODUCTIVITY_ERROR',
        message: 'Failed to get user productivity analytics'
      }
    });
  }
};

/**
 * Get team productivity analytics
 * 
 * @route GET /api/v1/productivity-analytics/team
 * @access Private
 */
export const getTeamProductivityAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { period = '30' } = req.query;

    logger.info('Getting team productivity analytics', { userId, period });

    // Get team time tracking summary
    const teamTimeTrackingResult = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.role,
        COALESCE(SUM(te.duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0) as billable_minutes,
        COUNT(DISTINCT te.id) as time_entries,
        ROUND(
          CASE 
            WHEN COALESCE(SUM(te.duration_minutes), 0) > 0 
            THEN (COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0) / COALESCE(SUM(te.duration_minutes), 0)) * 100
            ELSE 0 
          END, 2
        ) as billable_percentage
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.start_time >= CURRENT_DATE - INTERVAL '${period} days'
      WHERE u.role IN ('partner', 'senior_associate', 'junior_associate', 'paralegal')
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY billable_minutes DESC
    `);

    // Get team task completion summary
    const teamTaskCompletionResult = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.role,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
        COUNT(DISTINCT t.id) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')) as overdue_tasks,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT t.id) > 0 
            THEN (COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::float / COUNT(DISTINCT t.id)) * 100
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to 
        AND t.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      WHERE u.role IN ('partner', 'senior_associate', 'junior_associate', 'paralegal')
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY completion_rate DESC
    `);

    // Get team case productivity summary
    const teamCaseProductivityResult = await db.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.role,
        COUNT(DISTINCT c.id) as total_cases,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'completed') as completed_cases,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_cases,
        AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/86400) as avg_case_duration_days
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_to 
        AND c.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      WHERE u.role IN ('partner', 'senior_associate', 'junior_associate', 'paralegal')
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY completed_cases DESC
    `);

    const analytics = {
      timeTracking: teamTimeTrackingResult.rows,
      taskCompletion: teamTaskCompletionResult.rows,
      caseProductivity: teamCaseProductivityResult.rows
    };

    logger.info('Team productivity analytics fetched successfully', { userId });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error getting team productivity analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAM_PRODUCTIVITY_ERROR',
        message: 'Failed to get team productivity analytics'
      }
    });
  }
};

/**
 * Get efficiency metrics
 * 
 * @route GET /api/v1/productivity-analytics/efficiency
 * @access Private
 */
export const getEfficiencyMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { period = '90' } = req.query;

    logger.info('Getting efficiency metrics', { userId, period });

    // Get time utilization efficiency
    const timeUtilizationResult = await db.query(`
      SELECT 
        DATE_TRUNC('week', start_time) as week,
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0) as billable_minutes,
        ROUND(
          CASE 
            WHEN COALESCE(SUM(duration_minutes), 0) > 0 
            THEN (COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0) / COALESCE(SUM(duration_minutes), 0)) * 100
            ELSE 0 
          END, 2
        ) as utilization_rate
      FROM time_entries 
      WHERE start_time >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('week', start_time)
      ORDER BY week DESC
    `);

    // Get task efficiency metrics
    const taskEfficiencyResult = await db.query(`
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        AVG(EXTRACT(EPOCH FROM (completed_date - created_at))/3600) as avg_completion_hours,
        ROUND(
          CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)) * 100
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM tasks 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week DESC
    `);

    // Get case efficiency metrics
    const caseEfficiencyResult = await db.query(`
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_cases,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_case_duration_days,
        ROUND(
          CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)) * 100
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM cases 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week DESC
    `);

    const metrics = {
      timeUtilization: timeUtilizationResult.rows,
      taskEfficiency: taskEfficiencyResult.rows,
      caseEfficiency: caseEfficiencyResult.rows
    };

    logger.info('Efficiency metrics fetched successfully', { userId });

    res.json({
      success: true,
      data: { metrics }
    });
  } catch (error) {
    logger.error('Error getting efficiency metrics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EFFICIENCY_METRICS_ERROR',
        message: 'Failed to get efficiency metrics'
      }
    });
  }
};

/**
 * Get performance benchmarking
 * 
 * @route GET /api/v1/productivity-analytics/benchmarking
 * @access Private
 */
export const getPerformanceBenchmarking = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { period = '90' } = req.query;

    logger.info('Getting performance benchmarking', { userId, period });

    // Get role-based benchmarks
    const roleBenchmarksResult = await db.query(`
      SELECT 
        u.role,
        COUNT(DISTINCT u.id) as user_count,
        AVG(COALESCE(SUM(te.duration_minutes), 0)) as avg_total_minutes,
        AVG(COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0)) as avg_billable_minutes,
        AVG(COUNT(DISTINCT t.id)) as avg_tasks,
        AVG(COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')) as avg_completed_tasks,
        AVG(COUNT(DISTINCT c.id)) as avg_cases,
        AVG(COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'completed')) as avg_completed_cases
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.start_time >= CURRENT_DATE - INTERVAL '${period} days'
      LEFT JOIN tasks t ON u.id = t.assigned_to 
        AND t.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      LEFT JOIN cases c ON u.id = c.assigned_to 
        AND c.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      WHERE u.role IN ('partner', 'senior_associate', 'junior_associate', 'paralegal')
      GROUP BY u.role, u.id
    `);

    // Get top performers by role
    const topPerformersByRoleResult = await db.query(`
      SELECT 
        u.role,
        u.first_name,
        u.last_name,
        COALESCE(SUM(te.duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0) as billable_minutes,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'completed') as completed_cases,
        ROUND(
          CASE 
            WHEN COALESCE(SUM(te.duration_minutes), 0) > 0 
            THEN (COALESCE(SUM(CASE WHEN te.is_billable THEN te.duration_minutes ELSE 0 END), 0) / COALESCE(SUM(te.duration_minutes), 0)) * 100
            ELSE 0 
          END, 2
        ) as utilization_rate
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id 
        AND te.start_time >= CURRENT_DATE - INTERVAL '${period} days'
      LEFT JOIN tasks t ON u.id = t.assigned_to 
        AND t.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      LEFT JOIN cases c ON u.id = c.assigned_to 
        AND c.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      WHERE u.role IN ('partner', 'senior_associate', 'junior_associate', 'paralegal')
      GROUP BY u.role, u.id, u.first_name, u.last_name
      ORDER BY u.role, billable_minutes DESC
    `);

    // Get performance trends
    const performanceTrendsResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', start_time) as month,
        AVG(COALESCE(SUM(duration_minutes), 0)) as avg_total_minutes,
        AVG(COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0)) as avg_billable_minutes
      FROM time_entries 
      WHERE start_time >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('month', start_time), user_id
      ORDER BY month DESC
    `);

    const benchmarking = {
      roleBenchmarks: roleBenchmarksResult.rows,
      topPerformersByRole: topPerformersByRoleResult.rows,
      performanceTrends: performanceTrendsResult.rows
    };

    logger.info('Performance benchmarking fetched successfully', { userId });

    res.json({
      success: true,
      data: { benchmarking }
    });
  } catch (error) {
    logger.error('Error getting performance benchmarking', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERFORMANCE_BENCHMARKING_ERROR',
        message: 'Failed to get performance benchmarking'
      }
    });
  }
};

export default {
  getProductivityOverview,
  getUserProductivityAnalytics,
  getTeamProductivityAnalytics,
  getEfficiencyMetrics,
  getPerformanceBenchmarking
};