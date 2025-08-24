/**
 * Dashboard Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for dashboard statistics and analytics
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import { authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Get dashboard statistics
 * 
 * @route GET /api/v1/dashboard/stats
 * @access Private
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Fetching dashboard statistics', { userId });

    // Get counts for different entities
    // Get user statistics using centralized query
    const statsResult = await db.query(SQLQueries.DASHBOARD.GET_USER_STATS, [userId]);
    const userStats = statsResult.rows[0];

    // Calculate trends (simplified - in production, you'd compare with previous period)
    const stats = {
      cases: {
        count: parseInt(userStats.cases_count || '0'),
        trend: 5 // Mock trend percentage
      },
      clients: {
        count: parseInt(userStats.clients_count || '0'),
        trend: 12 // Mock trend percentage
      },
      documents: {
        count: parseInt(userStats.documents_count || '0'),
        trend: 8 // Mock trend percentage
      },
      time_entries: {
        count: parseInt(userStats.time_entries_count || '0'),
        trend: -3 // Mock trend percentage
      },
      calendar_events: {
        count: parseInt(userStats.calendar_events_count || '0'),
        trend: 15 // Mock trend percentage
      },
      billing: {
        count: parseInt(userStats.invoices_count || '0'),
        trend: 20 // Mock trend percentage
      }
    };

    logger.info('Dashboard statistics fetched successfully', { userId, stats });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching dashboard statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_STATS_ERROR',
        message: 'Failed to fetch dashboard statistics'
      }
    });
  }
};

/**
 * Get recent activities
 * 
 * @route GET /api/v1/dashboard/activities
 * @access Private
 */
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Fetching recent activities', { userId, limit });

    // Get recent audit logs for the user using centralized query
    const activities = await db.query(SQLQueries.DASHBOARD.GET_RECENT_ACTIVITIES, [userId, limit]);

    // Format activities for frontend
    const formattedActivities = activities.rows.map((activity: any) => ({
      id: activity.id,
      type: activity.resource_type,
      action: activity.action,
      description: `${activity.action.replace('_', ' ')} ${activity.resource_type}`,
      createdAt: activity.created_at,
      icon: getActivityIcon(activity.resource_type),
      resourceId: activity.resource_id
    }));

    logger.info('Recent activities fetched successfully', { userId, count: formattedActivities.length });

    res.json({
      success: true,
      data: {
        activities: formattedActivities
      }
    });
  } catch (error) {
    logger.error('Error fetching recent activities', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_ACTIVITIES_ERROR',
        message: 'Failed to fetch recent activities'
      }
    });
  }
};

/**
 * Get dashboard summary
 * 
 * @route GET /api/v1/dashboard/summary
 * @access Private
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Fetching dashboard summary', { userId });

    // Get summary data using centralized query
    const trendsResult = await db.query(SQLQueries.DASHBOARD.GET_USER_TRENDS, ['active', userId]);
    const trends = trendsResult.rows[0];

    const summary = {
      activeCases: parseInt(trends.active_cases || '0'),
      pendingTasks: parseInt(trends.upcoming_events || '0'),
      upcomingEvents: parseInt(trends.events_this_week || '0'),
      recentDocuments: parseInt(trends.recent_documents || '0')
    };

    logger.info('Dashboard summary fetched successfully', { userId, summary });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error fetching dashboard summary', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_SUMMARY_ERROR',
        message: 'Failed to fetch dashboard summary'
      }
    });
  }
};

/**
 * Get activity icon based on resource type
 */
function getActivityIcon(resourceType: string): string {
  const icons: { [key: string]: string } = {
    user: 'person',
    client: 'people',
    case: 'business',
    document: 'description',
    time_entry: 'schedule',
    calendar_event: 'event',
    invoice: 'payment'
  };
  return icons[resourceType] || 'assignment';
}

export default {
  getDashboardStats,
  getRecentActivities,
  getDashboardSummary
};