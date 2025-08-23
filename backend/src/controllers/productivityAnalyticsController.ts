/**
 * Productivity Analytics Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
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
    const { startDate, endDate } = req.query;

    logger.info('Getting productivity overview', { userId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get overall productivity metrics
    const productivityResult = await db.query(`
      SELECT 
        SUM(total_hours_worked) as total_hours,
        SUM(billable_hours) as billable_hours,
        SUM(non_billable_hours) as non_billable_hours,
        SUM(tasks_completed) as tasks_completed,
        SUM(tasks_pending) as tasks_pending,
        SUM(cases_handled) as cases_handled,
        AVG(efficiency_score) as avg_efficiency,
        AVG(utilization_rate) as avg_utilization
      FROM productivity_metrics 
      WHERE metric_date >= $1 AND metric_date <= $2
    `, [start, end]);

    // Get user productivity ranking
    const userRankingResult = await db.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        SUM(pm.total_hours_worked) as total_hours,
        SUM(pm.billable_hours) as billable_hours,
        SUM(pm.tasks_completed) as tasks_completed,
        AVG(pm.efficiency_score) as avg_efficiency,
        AVG(pm.utilization_rate) as avg_utilization
      FROM productivity_metrics pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.metric_date >= $1 AND pm.metric_date <= $2
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY avg_efficiency DESC
      LIMIT 10
    `, [start, end]);

    // Get time utilization by category
    const timeUtilizationResult = await db.query(`
      SELECT 
        t.task_type,
        SUM(tte.duration_minutes) as total_minutes,
        COUNT(tte.id) as time_entries,
        AVG(tte.duration_minutes) as avg_duration
      FROM task_time_entries tte
      JOIN tasks t ON tte.task_id = t.id
      WHERE tte.start_time >= $1 AND tte.start_time <= $2
      GROUP BY t.task_type
      ORDER BY total_minutes DESC
    `, [start, end]);

    const overview = {
      productivity: {
        totalHours: parseFloat(productivityResult.rows[0]?.total_hours || '0'),
        billableHours: parseFloat(productivityResult.rows[0]?.billable_hours || '0'),
        nonBillableHours: parseFloat(productivityResult.rows[0]?.non_billable_hours || '0'),
        tasksCompleted: parseInt(productivityResult.rows[0]?.tasks_completed || '0'),
        tasksPending: parseInt(productivityResult.rows[0]?.tasks_pending || '0'),
        casesHandled: parseInt(productivityResult.rows[0]?.cases_handled || '0'),
        avgEfficiency: parseFloat(productivityResult.rows[0]?.avg_efficiency || '0'),
        avgUtilization: parseFloat(productivityResult.rows[0]?.avg_utilization || '0')
      },
      userRanking: userRankingResult.rows,
      timeUtilization: timeUtilizationResult.rows
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
 * Get user productivity analytics
 * 
 * @route GET /api/v1/productivity-analytics/user/:userId
 * @access Private
 */
export const getUserProductivityAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = (req.user as any)?.id;
    const { startDate, endDate } = req.query;

    logger.info('Getting user productivity analytics', { userId, targetUserId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get user productivity metrics
    const productivityResult = await db.query(`
      SELECT 
        metric_date,
        total_hours_worked,
        billable_hours,
        non_billable_hours,
        tasks_completed,
        tasks_pending,
        cases_handled,
        efficiency_score,
        utilization_rate
      FROM productivity_metrics 
      WHERE user_id = $1 AND metric_date >= $2 AND metric_date <= $3
      ORDER BY metric_date
    `, [targetUserId, start, end]);

    // Get user's task completion trends
    const taskTrendsResult = await db.query(`
      SELECT 
        DATE_TRUNC('week', t.created_at) as week,
        COUNT(*) as tasks_created,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed,
        AVG(EXTRACT(EPOCH FROM (t.completed_date - t.created_at))/86400) as avg_completion_days
      FROM tasks t
      WHERE t.assigned_to = $1 AND t.created_at >= $2 AND t.created_at <= $3
      GROUP BY DATE_TRUNC('week', t.created_at)
      ORDER BY week
    `, [targetUserId, start, end]);

    // Get user's time tracking details
    const timeTrackingResult = await db.query(`
      SELECT 
        DATE_TRUNC('day', tte.start_time) as date,
        SUM(tte.duration_minutes) as total_minutes,
        SUM(CASE WHEN tte.is_billable THEN tte.duration_minutes ELSE 0 END) as billable_minutes,
        COUNT(*) as time_entries
      FROM task_time_entries tte
      WHERE tte.user_id = $1 AND tte.start_time >= $2 AND tte.start_time <= $3
      GROUP BY DATE_TRUNC('day', tte.start_time)
      ORDER BY date
    `, [targetUserId, start, end]);

    // Get user's case performance
    const casePerformanceResult = await db.query(`
      SELECT 
        c.id,
        c.case_number,
        c.title,
        c.status,
        c.created_at,
        c.updated_at,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        SUM(tte.duration_minutes) as total_time_minutes
      FROM cases c
      LEFT JOIN tasks t ON c.id = t.case_id AND t.assigned_to = $1
      LEFT JOIN task_time_entries tte ON t.id = tte.task_id
      WHERE c.assigned_to = $1 AND c.created_at >= $2 AND c.created_at <= $3
      GROUP BY c.id, c.case_number, c.title, c.status, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `, [targetUserId, start, end]);

    const analytics = {
      productivity: productivityResult.rows,
      taskTrends: taskTrendsResult.rows,
      timeTracking: timeTrackingResult.rows,
      casePerformance: casePerformanceResult.rows
    };

    logger.info('User productivity analytics fetched successfully', { userId, targetUserId });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    logger.error('Error getting user productivity analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_PRODUCTIVITY_ANALYTICS_ERROR',
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
    const { startDate, endDate, role } = req.query;

    logger.info('Getting team productivity analytics', { userId, startDate, endDate, role });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    let roleFilter = '';
    if (role) {
      roleFilter = `AND u.role = '${role}'`;
    }

    // Get team productivity summary
    const teamSummaryResult = await db.query(`
      SELECT 
        u.role,
        COUNT(DISTINCT u.id) as user_count,
        SUM(pm.total_hours_worked) as total_hours,
        SUM(pm.billable_hours) as billable_hours,
        SUM(pm.tasks_completed) as tasks_completed,
        AVG(pm.efficiency_score) as avg_efficiency,
        AVG(pm.utilization_rate) as avg_utilization
      FROM productivity_metrics pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.metric_date >= $1 AND pm.metric_date <= $2 ${roleFilter}
      GROUP BY u.role
      ORDER BY avg_efficiency DESC
    `, [start, end]);

    // Get team performance comparison
    const teamComparisonResult = await db.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        SUM(pm.total_hours_worked) as total_hours,
        SUM(pm.billable_hours) as billable_hours,
        SUM(pm.tasks_completed) as tasks_completed,
        AVG(pm.efficiency_score) as avg_efficiency,
        AVG(pm.utilization_rate) as avg_utilization,
        COUNT(DISTINCT c.id) as cases_handled
      FROM productivity_metrics pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN cases c ON u.id = c.assigned_to
      WHERE pm.metric_date >= $1 AND pm.metric_date <= $2 ${roleFilter}
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY avg_efficiency DESC
    `, [start, end]);

    // Get team workload distribution
    const workloadDistributionResult = await db.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(c.id) as active_cases
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      LEFT JOIN cases c ON u.id = c.assigned_to AND c.status IN ('active', 'pending')
      WHERE u.role != 'client' ${roleFilter}
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY total_tasks DESC
    `);

    const analytics = {
      teamSummary: teamSummaryResult.rows,
      teamComparison: teamComparisonResult.rows,
      workloadDistribution: workloadDistributionResult.rows
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
        code: 'TEAM_PRODUCTIVITY_ANALYTICS_ERROR',
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
    const { startDate, endDate, userId: targetUserId } = req.query;

    logger.info('Getting efficiency metrics', { userId, startDate, endDate, targetUserId });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    let userFilter = '';
    if (targetUserId) {
      userFilter = `AND pm.user_id = '${targetUserId}'`;
    }

    // Get efficiency trends
    const efficiencyTrendsResult = await db.query(`
      SELECT 
        DATE_TRUNC('week', pm.metric_date) as week,
        AVG(pm.efficiency_score) as avg_efficiency,
        AVG(pm.utilization_rate) as avg_utilization,
        SUM(pm.billable_hours) as total_billable_hours,
        SUM(pm.total_hours_worked) as total_hours
      FROM productivity_metrics pm
      WHERE pm.metric_date >= $1 AND pm.metric_date <= $2 ${userFilter}
      GROUP BY DATE_TRUNC('week', pm.metric_date)
      ORDER BY week
    `, [start, end]);

    // Get efficiency by task type
    const efficiencyByTaskTypeResult = await db.query(`
      SELECT 
        t.task_type,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        AVG(EXTRACT(EPOCH FROM (t.completed_date - t.created_at))/86400) as avg_completion_days,
        SUM(t.actual_hours) as total_actual_hours,
        SUM(t.estimated_hours) as total_estimated_hours
      FROM tasks t
      WHERE t.created_at >= $1 AND t.created_at <= $2 ${userFilter}
      GROUP BY t.task_type
      ORDER BY total_tasks DESC
    `, [start, end]);

    // Get time accuracy metrics
    const timeAccuracyResult = await db.query(`
      SELECT 
        t.id,
        t.title,
        t.task_type,
        t.estimated_hours,
        t.actual_hours,
        CASE 
          WHEN t.estimated_hours > 0 THEN 
            ((t.actual_hours - t.estimated_hours) / t.estimated_hours) * 100
          ELSE 0
        END as accuracy_percentage
      FROM tasks t
      WHERE t.status = 'completed' 
      AND t.created_at >= $1 AND t.created_at <= $2 ${userFilter}
      AND t.estimated_hours > 0
      ORDER BY accuracy_percentage DESC
      LIMIT 20
    `, [start, end]);

    const metrics = {
      efficiencyTrends: efficiencyTrendsResult.rows,
      efficiencyByTaskType: efficiencyByTaskTypeResult.rows,
      timeAccuracy: timeAccuracyResult.rows
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
    const { startDate, endDate } = req.query;

    logger.info('Getting performance benchmarking', { userId, startDate, endDate });

    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();

    // Get industry benchmarks (mock data - in real implementation, this would come from external sources)
    const industryBenchmarks = {
      avgEfficiency: 75.0,
      avgUtilization: 80.0,
      avgBillableHours: 160.0,
      avgTaskCompletion: 85.0
    };

    // Get current performance vs benchmarks
    const currentPerformanceResult = await db.query(`
      SELECT 
        AVG(pm.efficiency_score) as avg_efficiency,
        AVG(pm.utilization_rate) as avg_utilization,
        AVG(pm.billable_hours) as avg_billable_hours,
        (COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / COUNT(t.id)) as task_completion_rate
      FROM productivity_metrics pm
      LEFT JOIN tasks t ON pm.user_id = t.assigned_to
      WHERE pm.metric_date >= $1 AND pm.metric_date <= $2
    `, [start, end]);

    const current = currentPerformanceResult.rows[0];

    const benchmarking = {
      industryBenchmarks,
      currentPerformance: {
        avgEfficiency: parseFloat(current?.avg_efficiency || '0'),
        avgUtilization: parseFloat(current?.avg_utilization || '0'),
        avgBillableHours: parseFloat(current?.avg_billable_hours || '0'),
        taskCompletionRate: parseFloat(current?.task_completion_rate || '0')
      },
      comparison: {
        efficiencyGap: parseFloat(current?.avg_efficiency || '0') - industryBenchmarks.avgEfficiency,
        utilizationGap: parseFloat(current?.avg_utilization || '0') - industryBenchmarks.avgUtilization,
        billableHoursGap: parseFloat(current?.avg_billable_hours || '0') - industryBenchmarks.avgBillableHours,
        taskCompletionGap: parseFloat(current?.task_completion_rate || '0') - industryBenchmarks.avgTaskCompletion
      }
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