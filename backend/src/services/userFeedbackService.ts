/**
 * User Feedback Service
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This service provides comprehensive user feedback collection
 * and analysis for continuous improvement of the legal practice management system.
 */

import { DatabaseService } from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import { SQLQueries } from '@/utils/db_SQLQueries';
import { UserRole, hasPermission } from '@/utils/roleAccess';
import { sendEmail } from '@/utils/emailService';
import { sendNotification } from '@/utils/notificationService';

const db = new DatabaseService();

/**
 * Feedback categories
 */
export enum FeedbackCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  GENERAL = 'general',
  USABILITY = 'usability',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

/**
 * Feedback status
 */
export enum FeedbackStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  IMPLEMENTED = 'implemented',
  DECLINED = 'declined',
  IN_PROGRESS = 'in_progress'
}

/**
 * User feedback interface
 */
export interface UserFeedback {
  id: string;
  userId: string;
  feature: string;
  rating: number;
  comment?: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt: Date | undefined;
  response?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  attachments?: string[];
  userAgent?: string;
  browser?: string;
  device?: string;
  location?: string;
  sessionId?: string;
}

/**
 * Feedback statistics interface
 */
export interface FeedbackStatistics {
  totalFeedback: number;
  averageRating: number;
  feedbackByCategory: Record<FeedbackCategory, number>;
  feedbackByStatus: Record<FeedbackStatus, number>;
  feedbackByPriority: Record<string, number>;
  recentFeedback: number;
  satisfactionTrend: number;
  topFeatures: Array<{ feature: string; rating: number; count: number }>;
  topIssues: Array<{ category: string; count: number; avgRating: number }>;
}

/**
 * User Feedback Service Class
 */
class UserFeedbackService {
  /**
   * Submit user feedback
   * @param feedbackData - The feedback data
   * @param userId - The user submitting feedback
   * @returns Promise<UserFeedback>
   */
  async submitFeedback(feedbackData: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>, userId: string): Promise<UserFeedback> {
    try {
      logger.info('Submitting user feedback', { userId, feature: feedbackData.feature, category: feedbackData.category });

      const feedback: UserFeedback = {
        id: this.generateFeedbackId(),
        ...feedbackData,
        status: FeedbackStatus.NEW,
        timestamp: new Date()
      };

      await db.query(SQLQueries.FEEDBACK.SUBMIT_FEEDBACK, [
        feedback.id,
        feedback.userId,
        feedback.feature,
        feedback.rating,
        feedback.comment,
        feedback.category,
        feedback.status,
        feedback.timestamp,
        feedback.priority,
        feedback.tags ? JSON.stringify(feedback.tags) : null,
        feedback.attachments ? JSON.stringify(feedback.attachments) : null,
        feedback.userAgent,
        feedback.browser,
        feedback.device,
        feedback.location,
        feedback.sessionId
      ]);

      // Send notification to admin team for high priority feedback
      if (feedback.priority === 'high' || feedback.priority === 'critical') {
        await this.notifyAdminTeam(feedback);
      }

      // Send confirmation to user
      await this.sendFeedbackConfirmation(feedback);

      logger.info('User feedback submitted successfully', { feedbackId: feedback.id });
      return feedback;
    } catch (error) {
      logger.error('Error submitting user feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Get feedback by ID
   * @param feedbackId - The feedback ID
   * @param userId - The requesting user ID
   * @returns Promise<UserFeedback | null>
   */
  async getFeedbackById(feedbackId: string, userId: string): Promise<UserFeedback | null> {
    try {
      const result = await db.query(SQLQueries.FEEDBACK.GET_FEEDBACK_BY_ID, [feedbackId]);
      
      if (result.length === 0) {
        return null;
      }

      const feedback = this.mapFeedbackFromRow(result[0]);
      
      // Check if user has permission to view this feedback
      if (!this.canUserAccessFeedback(feedback, userId)) {
        logger.warn('Unauthorized feedback access attempt', { feedbackId, userId });
        throw new Error('Unauthorized access to feedback');
      }

      return feedback;
    } catch (error) {
      logger.error('Error getting feedback by ID:', error as Error);
      throw error;
    }
  }

  /**
   * Get user's feedback history
   * @param userId - The user ID
   * @param filters - Optional filters
   * @returns Promise<UserFeedback[]>
   */
  async getUserFeedback(userId: string, filters?: {
    category?: FeedbackCategory;
    status?: FeedbackStatus;
    limit?: number;
    offset?: number;
  }): Promise<UserFeedback[]> {
    try {
      let query = SQLQueries.FEEDBACK.GET_USER_FEEDBACK;
      const params: any[] = [userId];

      if (filters?.category) {
        query += ' AND category = $' + (params.length + 1);
        params.push(filters.category);
      }

      if (filters?.status) {
        query += ' AND status = $' + (params.length + 1);
        params.push(filters.status);
      }

      query += ' ORDER BY timestamp DESC';

      if (filters?.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ' OFFSET $' + (params.length + 1);
        params.push(filters.offset);
      }

      const result = await db.query(query, params);
      return result.map((row: any) => this.mapFeedbackFromRow(row));
    } catch (error) {
      logger.error('Error getting user feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Get all feedback (for admin team)
   * @param userId - The requesting user ID
   * @param filters - Optional filters
   * @returns Promise<UserFeedback[]>
   */
  async getAllFeedback(userId: string, filters?: {
    category?: FeedbackCategory;
    status?: FeedbackStatus;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserFeedback[]> {
    try {
      // Check if user has permission to view all feedback
      if (!hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_READ_ALL)) {
        throw new Error('Unauthorized access to all feedback');
      }

      let query = SQLQueries.FEEDBACK.GET_ALL_FEEDBACK;
      const params: any[] = [];

      if (filters?.category) {
        query += ' WHERE category = $' + (params.length + 1);
        params.push(filters.category);
      }

      if (filters?.status) {
        query += (params.length === 0 ? ' WHERE' : ' AND') + ' status = $' + (params.length + 1);
        params.push(filters.status);
      }

      if (filters?.priority) {
        query += (params.length === 0 ? ' WHERE' : ' AND') + ' priority = $' + (params.length + 1);
        params.push(filters.priority);
      }

      query += ' ORDER BY timestamp DESC';

      if (filters?.limit) {
        query += ' LIMIT $' + (params.length + 1);
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ' OFFSET $' + (params.length + 1);
        params.push(filters.offset);
      }

      const result = await db.query(query, params);
      return result.map((row: any) => this.mapFeedbackFromRow(row));
    } catch (error) {
      logger.error('Error getting all feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Update feedback status
   * @param feedbackId - The feedback ID
   * @param status - The new status
   * @param userId - The user updating the feedback
   * @param response - Optional response to user
   * @returns Promise<UserFeedback>
   */
  async updateFeedbackStatus(feedbackId: string, status: FeedbackStatus, userId: string, response?: string): Promise<UserFeedback> {
    try {
      const feedback = await this.getFeedbackById(feedbackId, userId);
      if (!feedback) {
        throw new Error('Feedback not found');
      }

      // Check if user has permission to update feedback
      if (!hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_UPDATE)) {
        throw new Error('Unauthorized to update feedback');
      }

      await db.query(SQLQueries.FEEDBACK.UPDATE_FEEDBACK_STATUS, [
        feedbackId,
        status,
        userId,
        new Date(),
        response
      ]);

      // Send notification to user if status changed
      if (status !== feedback.status) {
        await this.notifyUserOfStatusChange(feedback, status, response);
      }

      logger.info('Feedback status updated', { feedbackId, status, userId });
      
      return await this.getFeedbackById(feedbackId, userId) as UserFeedback;
    } catch (error) {
      logger.error('Error updating feedback status:', error as Error);
      throw error;
    }
  }

  /**
   * Get feedback statistics
   * @param userId - The requesting user ID
   * @param filters - Optional filters
   * @returns Promise<FeedbackStatistics>
   */
  async getFeedbackStatistics(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: FeedbackCategory;
  }): Promise<FeedbackStatistics> {
    try {
      // Check if user has permission to view statistics
      if (!hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_VIEW_STATS)) {
        throw new Error('Unauthorized to view feedback statistics');
      }

      const result = await db.query(SQLQueries.FEEDBACK.GET_FEEDBACK_STATISTICS, [
        filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        filters?.endDate || new Date(),
        filters?.category || null
      ]);

      return this.mapStatisticsFromRow(result[0]);
    } catch (error) {
      logger.error('Error getting feedback statistics:', error as Error);
      throw error;
    }
  }

  /**
   * Search feedback
   * @param searchTerm - The search term
   * @param userId - The requesting user ID
   * @returns Promise<UserFeedback[]>
   */
  async searchFeedback(searchTerm: string, _userId: string): Promise<UserFeedback[]> {
    try {
      // Check if user has permission to search feedback
      if (!hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_SEARCH)) {
        throw new Error('Unauthorized to search feedback');
      }

      const result = await db.query(SQLQueries.FEEDBACK.SEARCH_FEEDBACK, [`%${searchTerm}%`]);
      return result.map((row: any) => this.mapFeedbackFromRow(row));
    } catch (error) {
      logger.error('Error searching feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Get feedback trends
   * @param userId - The requesting user ID
   * @param days - Number of days to analyze
   * @returns Promise<any>
   */
  async getFeedbackTrends(_userId: string, days: number = 30): Promise<any> {
    try {
      // Check if user has permission to view trends
      if (!hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_VIEW_TRENDS)) {
        throw new Error('Unauthorized to view feedback trends');
      }

      const result = await db.query(SQLQueries.FEEDBACK.GET_FEEDBACK_TRENDS, [
        new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      ]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting feedback trends:', error as Error);
      throw error;
    }
  }

  /**
   * Get feature-specific feedback
   * @param feature - The feature name
   * @param userId - The requesting user ID
   * @returns Promise<UserFeedback[]>
   */
  async getFeatureFeedback(feature: string, _userId: string): Promise<UserFeedback[]> {
    try {
      const result = await db.query(SQLQueries.FEEDBACK.GET_FEATURE_FEEDBACK, [feature]);
      return result.map((row: any) => this.mapFeedbackFromRow(row));
    } catch (error) {
      logger.error('Error getting feature feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Get feedback analytics
   * @param userId - The requesting user ID
   * @param filters - Optional filters
   * @returns Promise<any>
   */
  async getFeedbackAnalytics(_userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: FeedbackCategory;
  }): Promise<any> {
    try {
      // Check if user has permission to view analytics
      if (!hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_VIEW_ANALYTICS)) {
        throw new Error('Unauthorized to view feedback analytics');
      }

      const result = await db.query(SQLQueries.FEEDBACK.GET_FEEDBACK_ANALYTICS, [
        filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        filters?.endDate || new Date(),
        filters?.category || null
      ]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting feedback analytics:', error as Error);
      throw error;
    }
  }

  /**
   * Generate unique feedback ID
   * @returns string
   */
  private generateFeedbackId(): string {
    return `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if user can access feedback
   * @param feedback - The feedback
   * @param userId - The user ID
   * @returns boolean
   */
  private canUserAccessFeedback(feedback: UserFeedback, userId: string): boolean {
    return feedback.userId === userId ||
                       hasPermission(UserRole.SUPER_ADMIN, Permission.FEEDBACK_READ_ALL);
  }

  /**
   * Map database row to feedback object
   * @param row - Database row
   * @returns UserFeedback
   */
  private mapFeedbackFromRow(row: any): UserFeedback {
    return {
      id: row.id,
      userId: row.user_id,
      feature: row.feature,
      rating: row.rating,
      comment: row.comment,
      category: row.category as FeedbackCategory,
      status: row.status as FeedbackStatus,
      timestamp: new Date(row.timestamp),
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      response: row.response,
      priority: row.priority,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
      userAgent: row.user_agent,
      browser: row.browser,
      device: row.device,
      location: row.location,
      sessionId: row.session_id
    };
  }

  /**
   * Map database row to statistics object
   * @param row - Database row
   * @returns FeedbackStatistics
   */
  private mapStatisticsFromRow(row: any): FeedbackStatistics {
    return {
      totalFeedback: parseInt(row.total_feedback),
      averageRating: parseFloat(row.avg_rating),
      feedbackByCategory: JSON.parse(row.feedback_by_category),
      feedbackByStatus: JSON.parse(row.feedback_by_status),
      feedbackByPriority: JSON.parse(row.feedback_by_priority),
      recentFeedback: parseInt(row.recent_feedback),
      satisfactionTrend: parseFloat(row.satisfaction_trend),
      topFeatures: JSON.parse(row.top_features),
      topIssues: JSON.parse(row.top_issues)
    };
  }

  /**
   * Notify admin team of high priority feedback
   * @param feedback - The feedback
   */
  private async notifyAdminTeam(feedback: UserFeedback): Promise<void> {
    try {
      await sendNotification(
        'admin-team',
        NotificationType.WARNING,
        NotificationPriority.HIGH,
        'High Priority Feedback Received',
        `High priority feedback received for ${feedback.feature}: ${feedback.comment?.substring(0, 100)}...`,
        { feedbackId: feedback.id, priority: feedback.priority }
      );
    } catch (error) {
      logger.error('Error notifying admin team:', error as Error);
    }
  }

  /**
   * Send feedback confirmation to user
   * @param feedback - The feedback
   */
  private async sendFeedbackConfirmation(feedback: UserFeedback): Promise<void> {
    try {
      await sendEmail({
        to: feedback.userId,
        subject: 'Feedback Received - Thank You',
        html: `Thank you for your feedback on ${feedback.feature}. We appreciate your input!`,
        data: { feedback }
      });
    } catch (error) {
      logger.error('Error sending feedback confirmation:', error as Error);
    }
  }

  /**
   * Notify user of status change
   * @param feedback - The feedback
   * @param status - The new status
   * @param response - The response
   */
  private async notifyUserOfStatusChange(feedback: UserFeedback, status: FeedbackStatus, response?: string): Promise<void> {
    try {
      await sendNotification(
        feedback.userId,
        NotificationType.INFO,
        NotificationPriority.MEDIUM,
        'Feedback Status Updated',
        `Your feedback status has been updated to ${status}`,
        { feedbackId: feedback.id, status, response }
      );
    } catch (error) {
      logger.error('Error notifying user of status change:', error as Error);
    }
  }
}

export default new UserFeedbackService();