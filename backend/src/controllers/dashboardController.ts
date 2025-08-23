/**
 * Dashboard Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
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
    const [
      casesCount,
      clientsCount,
      documentsCount,
      timeEntriesCount,
      calendarEventsCount,
      billingCount
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM cases WHERE created_by = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM clients WHERE created_by = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM documents WHERE uploaded_by = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM time_entries WHERE user_id = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM calendar_events WHERE created_by = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM invoices WHERE created_by = $1', [userId])
    ]);

    // Calculate trends (simplified - in production, you'd compare with previous period)
    const stats = {
      cases: {
        count: parseInt(casesCount.rows[0]?.count || '0'),
        trend: 5 // Mock trend percentage
      },
      clients: {
        count: parseInt(clientsCount.rows[0]?.count || '0'),
        trend: 12 // Mock trend percentage
      },
      documents: {
        count: parseInt(documentsCount.rows[0]?.count || '0'),
        trend: 8 // Mock trend percentage
      },
      time_entries: {
        count: parseInt(timeEntriesCount.rows[0]?.count || '0'),
        trend: -3 // Mock trend percentage
      },
      calendar_events: {
        count: parseInt(calendarEventsCount.rows[0]?.count || '0'),
        trend: 15 // Mock trend percentage
      },
      billing: {
        count: parseInt(billingCount.rows[0]?.count || '0'),
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

    // Get recent audit logs for the user
    const activitiesQuery = `
      SELECT 
        al.id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.created_at,
        al.old_values,
        al.new_values
      FROM audit_logs al
      WHERE al.user_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2
    `;

    const activities = await db.query(activitiesQuery, [userId, limit]);

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

    // Get summary data
    const [
      activeCases,
      pendingTasks,
      upcomingEvents,
      recentDocuments
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM cases WHERE status = $1 AND created_by = $2', ['active', userId]),
      db.query('SELECT COUNT(*) as count FROM calendar_events WHERE start_datetime > NOW() AND created_by = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM calendar_events WHERE start_datetime BETWEEN NOW() AND NOW() + INTERVAL \'7 days\' AND created_by = $1', [userId]),
      db.query('SELECT COUNT(*) as count FROM documents WHERE uploaded_by = $1 AND created_at > NOW() - INTERVAL \'7 days\'', [userId])
    ]);

    const summary = {
      activeCases: parseInt(activeCases.rows[0]?.count || '0'),
      pendingTasks: parseInt(pendingTasks.rows[0]?.count || '0'),
      upcomingEvents: parseInt(upcomingEvents.rows[0]?.count || '0'),
      recentDocuments: parseInt(recentDocuments.rows[0]?.count || '0')
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