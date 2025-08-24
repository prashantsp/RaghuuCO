"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackStatus = exports.FeedbackCategory = void 0;
const DatabaseService_1 = require("@/services/DatabaseService");
const logger_1 = require("@/utils/logger");
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const roleAccess_1 = require("@/utils/roleAccess");
const emailService_1 = require("@/utils/emailService");
const notificationService_1 = require("@/utils/notificationService");
const db = new DatabaseService_1.DatabaseService();
var FeedbackCategory;
(function (FeedbackCategory) {
    FeedbackCategory["BUG"] = "bug";
    FeedbackCategory["FEATURE"] = "feature";
    FeedbackCategory["IMPROVEMENT"] = "improvement";
    FeedbackCategory["GENERAL"] = "general";
    FeedbackCategory["USABILITY"] = "usability";
    FeedbackCategory["PERFORMANCE"] = "performance";
    FeedbackCategory["SECURITY"] = "security";
})(FeedbackCategory || (exports.FeedbackCategory = FeedbackCategory = {}));
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["NEW"] = "new";
    FeedbackStatus["REVIEWED"] = "reviewed";
    FeedbackStatus["IMPLEMENTED"] = "implemented";
    FeedbackStatus["DECLINED"] = "declined";
    FeedbackStatus["IN_PROGRESS"] = "in_progress";
})(FeedbackStatus || (exports.FeedbackStatus = FeedbackStatus = {}));
class UserFeedbackService {
    async submitFeedback(feedbackData, userId) {
        try {
            logger_1.logger.info('Submitting user feedback', { userId, feature: feedbackData.feature, category: feedbackData.category });
            const feedback = {
                id: this.generateFeedbackId(),
                ...feedbackData,
                status: FeedbackStatus.NEW,
                timestamp: new Date()
            };
            await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.SUBMIT_FEEDBACK, [
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
            if (feedback.priority === 'high' || feedback.priority === 'critical') {
                await this.notifyAdminTeam(feedback);
            }
            await this.sendFeedbackConfirmation(feedback);
            logger_1.logger.info('User feedback submitted successfully', { feedbackId: feedback.id });
            return feedback;
        }
        catch (error) {
            logger_1.logger.error('Error submitting user feedback:', error);
            throw error;
        }
    }
    async getFeedbackById(feedbackId, userId) {
        try {
            const result = await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.GET_FEEDBACK_BY_ID, [feedbackId]);
            if (result.rows.length === 0) {
                return null;
            }
            const feedback = this.mapFeedbackFromRow(result.rows[0]);
            if (!this.canUserAccessFeedback(feedback, userId)) {
                logger_1.logger.warn('Unauthorized feedback access attempt', { feedbackId, userId });
                throw new Error('Unauthorized access to feedback');
            }
            return feedback;
        }
        catch (error) {
            logger_1.logger.error('Error getting feedback by ID:', error);
            throw error;
        }
    }
    async getUserFeedback(userId, filters) {
        try {
            let query = db_SQLQueries_1.SQLQueries.FEEDBACK.GET_USER_FEEDBACK;
            const params = [userId];
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
            return result.rows.map(row => this.mapFeedbackFromRow(row));
        }
        catch (error) {
            logger_1.logger.error('Error getting user feedback:', error);
            throw error;
        }
    }
    async getAllFeedback(userId, filters) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:read_all')) {
                throw new Error('Unauthorized access to all feedback');
            }
            let query = db_SQLQueries_1.SQLQueries.FEEDBACK.GET_ALL_FEEDBACK;
            const params = [];
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
            return result.rows.map(row => this.mapFeedbackFromRow(row));
        }
        catch (error) {
            logger_1.logger.error('Error getting all feedback:', error);
            throw error;
        }
    }
    async updateFeedbackStatus(feedbackId, status, userId, response) {
        try {
            const feedback = await this.getFeedbackById(feedbackId, userId);
            if (!feedback) {
                throw new Error('Feedback not found');
            }
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:update')) {
                throw new Error('Unauthorized to update feedback');
            }
            await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.UPDATE_FEEDBACK_STATUS, [
                feedbackId,
                status,
                userId,
                new Date(),
                response
            ]);
            if (status !== feedback.status) {
                await this.notifyUserOfStatusChange(feedback, status, response);
            }
            logger_1.logger.info('Feedback status updated', { feedbackId, status, userId });
            return await this.getFeedbackById(feedbackId, userId);
        }
        catch (error) {
            logger_1.logger.error('Error updating feedback status:', error);
            throw error;
        }
    }
    async getFeedbackStatistics(userId, filters) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:view_stats')) {
                throw new Error('Unauthorized to view feedback statistics');
            }
            const result = await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.GET_FEEDBACK_STATISTICS, [
                filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                filters?.endDate || new Date(),
                filters?.category || null
            ]);
            return this.mapStatisticsFromRow(result.rows[0]);
        }
        catch (error) {
            logger_1.logger.error('Error getting feedback statistics:', error);
            throw error;
        }
    }
    async searchFeedback(searchTerm, userId) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:search')) {
                throw new Error('Unauthorized to search feedback');
            }
            const result = await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.SEARCH_FEEDBACK, [`%${searchTerm}%`]);
            return result.rows.map(row => this.mapFeedbackFromRow(row));
        }
        catch (error) {
            logger_1.logger.error('Error searching feedback:', error);
            throw error;
        }
    }
    async getFeedbackTrends(userId, days = 30) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:view_trends')) {
                throw new Error('Unauthorized to view feedback trends');
            }
            const result = await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.GET_FEEDBACK_TRENDS, [
                new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            ]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error getting feedback trends:', error);
            throw error;
        }
    }
    async getFeatureFeedback(feature, userId) {
        try {
            const result = await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.GET_FEATURE_FEEDBACK, [feature]);
            return result.rows.map(row => this.mapFeedbackFromRow(row));
        }
        catch (error) {
            logger_1.logger.error('Error getting feature feedback:', error);
            throw error;
        }
    }
    async getFeedbackAnalytics(userId, filters) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:view_analytics')) {
                throw new Error('Unauthorized to view feedback analytics');
            }
            const result = await db.query(db_SQLQueries_1.SQLQueries.FEEDBACK.GET_FEEDBACK_ANALYTICS, [
                filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                filters?.endDate || new Date(),
                filters?.category || null
            ]);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error('Error getting feedback analytics:', error);
            throw error;
        }
    }
    generateFeedbackId() {
        return `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    canUserAccessFeedback(feedback, userId) {
        return feedback.userId === userId ||
            (0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, 'feedback:read_all');
    }
    mapFeedbackFromRow(row) {
        return {
            id: row.id,
            userId: row.user_id,
            feature: row.feature,
            rating: row.rating,
            comment: row.comment,
            category: row.category,
            status: row.status,
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
    mapStatisticsFromRow(row) {
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
    async notifyAdminTeam(feedback) {
        try {
            await (0, notificationService_1.sendNotification)({
                type: 'high_priority_feedback',
                title: 'High Priority Feedback Received',
                message: `High priority feedback received for ${feedback.feature}: ${feedback.comment?.substring(0, 100)}...`,
                recipients: ['admin-team'],
                data: { feedbackId: feedback.id, priority: feedback.priority }
            });
        }
        catch (error) {
            logger_1.logger.error('Error notifying admin team:', error);
        }
    }
    async sendFeedbackConfirmation(feedback) {
        try {
            await (0, emailService_1.sendEmail)({
                to: feedback.userId,
                subject: 'Feedback Received - Thank You',
                template: 'feedback-confirmation',
                data: { feedback }
            });
        }
        catch (error) {
            logger_1.logger.error('Error sending feedback confirmation:', error);
        }
    }
    async notifyUserOfStatusChange(feedback, status, response) {
        try {
            await (0, notificationService_1.sendNotification)({
                type: 'feedback_status_changed',
                title: 'Feedback Status Updated',
                message: `Your feedback status has been updated to ${status}`,
                recipients: [feedback.userId],
                data: { feedbackId: feedback.id, status, response }
            });
        }
        catch (error) {
            logger_1.logger.error('Error notifying user of status change:', error);
        }
    }
}
exports.default = new UserFeedbackService();
//# sourceMappingURL=userFeedbackService.js.map