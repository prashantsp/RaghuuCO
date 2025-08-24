"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketCategory = exports.TicketStatus = exports.TicketPriority = void 0;
const DatabaseService_1 = require("@/services/DatabaseService");
const logger_1 = require("@/utils/logger");
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const roleAccess_1 = require("@/utils/roleAccess");
const emailService_1 = require("../utils/emailService");
const notificationService_1 = require("../utils/notificationService");
const db = new DatabaseService_1.DatabaseService();
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "low";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["HIGH"] = "high";
    TicketPriority["CRITICAL"] = "critical";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "open";
    TicketStatus["IN_PROGRESS"] = "in-progress";
    TicketStatus["RESOLVED"] = "resolved";
    TicketStatus["CLOSED"] = "closed";
    TicketStatus["ESCALATED"] = "escalated";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketCategory;
(function (TicketCategory) {
    TicketCategory["TECHNICAL"] = "technical";
    TicketCategory["BILLING"] = "billing";
    TicketCategory["TRAINING"] = "training";
    TicketCategory["FEATURE_REQUEST"] = "feature_request";
    TicketCategory["BUG_REPORT"] = "bug_report";
    TicketCategory["GENERAL"] = "general";
})(TicketCategory || (exports.TicketCategory = TicketCategory = {}));
class SupportTicketService {
    async createTicket(ticketData, userId) {
        try {
            logger_1.logger.info('Creating support ticket', { userId, subject: ticketData.subject });
            const ticket = {
                id: this.generateTicketId(),
                ...ticketData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.CREATE_TICKET, [
                ticket.id,
                ticket.userId,
                ticket.subject,
                ticket.description,
                ticket.priority,
                ticket.status,
                ticket.category,
                ticket.assignedTo,
                ticket.createdAt,
                ticket.updatedAt,
                ticket.attachments ? JSON.stringify(ticket.attachments) : null,
                ticket.tags ? JSON.stringify(ticket.tags) : null,
                ticket.internalNotes
            ]);
            await this.notifySupportTeam(ticket);
            await this.sendTicketConfirmation(ticket);
            logger_1.logger.info('Support ticket created successfully', { ticketId: ticket.id });
            return ticket;
        }
        catch (error) {
            logger_1.logger.error('Error creating support ticket:', error);
            throw error;
        }
    }
    async getTicketById(ticketId, userId) {
        try {
            const result = await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.GET_TICKET_BY_ID, [ticketId]);
            if (result.length === 0) {
                return null;
            }
            const ticket = this.mapTicketFromRow(result[0]);
            if (!this.canUserAccessTicket(ticket, userId)) {
                logger_1.logger.warn('Unauthorized ticket access attempt', { ticketId, userId });
                throw new Error('Unauthorized access to ticket');
            }
            return ticket;
        }
        catch (error) {
            logger_1.logger.error('Error getting ticket by ID:', error);
            throw error;
        }
    }
    async getUserTickets(userId, filters) {
        try {
            let query = db_SQLQueries_1.SQLQueries.SUPPORT.GET_USER_TICKETS;
            const params = [userId];
            if (filters?.status) {
                query += ' AND status = $' + (params.length + 1);
                params.push(filters.status);
            }
            if (filters?.priority) {
                query += ' AND priority = $' + (params.length + 1);
                params.push(filters.priority);
            }
            if (filters?.category) {
                query += ' AND category = $' + (params.length + 1);
                params.push(filters.category);
            }
            query += ' ORDER BY created_at DESC';
            if (filters?.limit) {
                query += ' LIMIT $' + (params.length + 1);
                params.push(filters.limit);
            }
            if (filters?.offset) {
                query += ' OFFSET $' + (params.length + 1);
                params.push(filters.offset);
            }
            const result = await db.query(query, params);
            return result.map((row) => this.mapTicketFromRow(row));
        }
        catch (error) {
            logger_1.logger.error('Error getting user tickets:', error);
            throw error;
        }
    }
    async getAllTickets(_userId, filters) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, Permission.SUPPORT_READ_ALL)) {
                throw new Error('Unauthorized access to all tickets');
            }
            let query = db_SQLQueries_1.SQLQueries.SUPPORT.GET_ALL_TICKETS;
            const params = [];
            if (filters?.status) {
                query += ' WHERE status = $' + (params.length + 1);
                params.push(filters.status);
            }
            if (filters?.priority) {
                query += (params.length === 0 ? ' WHERE' : ' AND') + ' priority = $' + (params.length + 1);
                params.push(filters.priority);
            }
            if (filters?.category) {
                query += (params.length === 0 ? ' WHERE' : ' AND') + ' category = $' + (params.length + 1);
                params.push(filters.category);
            }
            if (filters?.assignedTo) {
                query += (params.length === 0 ? ' WHERE' : ' AND') + ' assigned_to = $' + (params.length + 1);
                params.push(filters.assignedTo);
            }
            query += ' ORDER BY created_at DESC';
            if (filters?.limit) {
                query += ' LIMIT $' + (params.length + 1);
                params.push(filters.limit);
            }
            if (filters?.offset) {
                query += ' OFFSET $' + (params.length + 1);
                params.push(filters.offset);
            }
            const result = await db.query(query, params);
            return result.map((row) => this.mapTicketFromRow(row));
        }
        catch (error) {
            logger_1.logger.error('Error getting all tickets:', error);
            throw error;
        }
    }
    async updateTicketStatus(ticketId, status, userId) {
        try {
            const ticket = await this.getTicketById(ticketId, userId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            if (!this.canUserUpdateTicket(ticket, userId)) {
                throw new Error('Unauthorized to update ticket');
            }
            const updatedAt = new Date();
            let resolvedAt = ticket.resolvedAt;
            if (status === TicketStatus.RESOLVED && !resolvedAt) {
                resolvedAt = new Date();
            }
            await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.UPDATE_TICKET_STATUS, [
                ticketId,
                status,
                updatedAt,
                resolvedAt
            ]);
            await this.notifyUserOfStatusChange(ticket, status);
            logger_1.logger.info('Ticket status updated', { ticketId, status, userId });
            return await this.getTicketById(ticketId, userId);
        }
        catch (error) {
            logger_1.logger.error('Error updating ticket status:', error);
            throw error;
        }
    }
    async assignTicket(ticketId, assignedTo, userId) {
        try {
            const ticket = await this.getTicketById(ticketId, userId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, Permission.SUPPORT_ASSIGN)) {
                throw new Error('Unauthorized to assign tickets');
            }
            await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.ASSIGN_TICKET, [
                ticketId,
                assignedTo,
                new Date()
            ]);
            await this.notifyAssignedUser(ticket, assignedTo);
            logger_1.logger.info('Ticket assigned', { ticketId, assignedTo, userId });
            return await this.getTicketById(ticketId, userId);
        }
        catch (error) {
            logger_1.logger.error('Error assigning ticket:', error);
            throw error;
        }
    }
    async addComment(ticketId, comment, userId) {
        try {
            const ticket = await this.getTicketById(ticketId, userId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            if (!this.canUserAccessTicket(ticket, userId)) {
                throw new Error('Unauthorized to comment on ticket');
            }
            const ticketComment = {
                id: this.generateCommentId(),
                ...comment,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.ADD_COMMENT, [
                ticketComment.id,
                ticketId,
                ticketComment.userId,
                ticketComment.comment,
                ticketComment.isInternal,
                ticketComment.createdAt,
                ticketComment.updatedAt
            ]);
            await this.notifyCommentAdded(ticket, ticketComment);
            logger_1.logger.info('Comment added to ticket', { ticketId, commentId: ticketComment.id, userId });
            return ticketComment;
        }
        catch (error) {
            logger_1.logger.error('Error adding comment to ticket:', error);
            throw error;
        }
    }
    async getTicketStatistics(_userId, filters) {
        try {
            if (!(0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, Permission.SUPPORT_VIEW_STATS)) {
                throw new Error('Unauthorized to view ticket statistics');
            }
            const result = await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.GET_TICKET_STATISTICS, [
                filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                filters?.endDate || new Date(),
                filters?.category || null
            ]);
            return this.mapStatisticsFromRow(result[0]);
        }
        catch (error) {
            logger_1.logger.error('Error getting ticket statistics:', error);
            throw error;
        }
    }
    async resolveTicket(ticketId, resolution, userId) {
        try {
            const ticket = await this.getTicketById(ticketId, userId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            if (!this.canUserUpdateTicket(ticket, userId)) {
                throw new Error('Unauthorized to resolve ticket');
            }
            await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.RESOLVE_TICKET, [
                ticketId,
                TicketStatus.RESOLVED,
                resolution,
                new Date(),
                new Date()
            ]);
            await this.sendResolutionNotification(ticket, resolution);
            logger_1.logger.info('Ticket resolved', { ticketId, userId });
            return await this.getTicketById(ticketId, userId);
        }
        catch (error) {
            logger_1.logger.error('Error resolving ticket:', error);
            throw error;
        }
    }
    async rateTicketSatisfaction(ticketId, rating, userId) {
        try {
            const ticket = await this.getTicketById(ticketId, userId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            if (ticket.userId !== userId) {
                throw new Error('Only ticket creator can rate satisfaction');
            }
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            await db.query(db_SQLQueries_1.SQLQueries.SUPPORT.RATE_TICKET_SATISFACTION, [
                ticketId,
                rating,
                new Date()
            ]);
            logger_1.logger.info('Ticket satisfaction rated', { ticketId, rating, userId });
        }
        catch (error) {
            logger_1.logger.error('Error rating ticket satisfaction:', error);
            throw error;
        }
    }
    generateTicketId() {
        return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCommentId() {
        return `COM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    canUserAccessTicket(ticket, userId) {
        return ticket.userId === userId ||
            ticket.assignedTo === userId ||
            (0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, Permission.SUPPORT_READ_ALL);
    }
    canUserUpdateTicket(ticket, userId) {
        return ticket.assignedTo === userId ||
            (0, roleAccess_1.hasPermission)(roleAccess_1.UserRole.SUPER_ADMIN, Permission.SUPPORT_UPDATE);
    }
    mapTicketFromRow(row) {
        return {
            id: row.id,
            userId: row.user_id,
            subject: row.subject,
            description: row.description,
            priority: row.priority,
            status: row.status,
            category: row.category,
            assignedTo: row.assigned_to,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
            resolution: row.resolution,
            attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
            tags: row.tags ? JSON.parse(row.tags) : undefined,
            estimatedResolutionTime: row.estimated_resolution_time ? new Date(row.estimated_resolution_time) : undefined,
            actualResolutionTime: row.actual_resolution_time ? new Date(row.actual_resolution_time) : undefined,
            userSatisfaction: row.user_satisfaction,
            internalNotes: row.internal_notes
        };
    }
    mapStatisticsFromRow(row) {
        return {
            totalTickets: parseInt(row.total_tickets),
            openTickets: parseInt(row.open_tickets),
            resolvedTickets: parseInt(row.resolved_tickets),
            averageResolutionTime: parseFloat(row.avg_resolution_time),
            userSatisfaction: parseFloat(row.avg_satisfaction),
            ticketsByPriority: JSON.parse(row.tickets_by_priority),
            ticketsByCategory: JSON.parse(row.tickets_by_category),
            ticketsByStatus: JSON.parse(row.tickets_by_status)
        };
    }
    async notifySupportTeam(ticket) {
        try {
            await (0, notificationService_1.sendNotification)('support-team', NotificationType.INFO, NotificationPriority.HIGH, 'New Support Ticket', `New ${ticket.priority} priority ticket: ${ticket.subject}`, { ticketId: ticket.id });
        }
        catch (error) {
            logger_1.logger.error('Error notifying support team:', error);
        }
    }
    async sendTicketConfirmation(ticket) {
        try {
            await (0, emailService_1.sendEmail)({
                to: ticket.userId,
                subject: `Support Ticket Created - ${ticket.id}`,
                html: `Your ticket "${ticket.subject}" has been created successfully.`,
                data: { ticket }
            });
        }
        catch (error) {
            logger_1.logger.error('Error sending ticket confirmation:', error);
        }
    }
    async notifyUserOfStatusChange(ticket, status) {
        try {
            await (0, notificationService_1.sendNotification)(ticket.userId, NotificationType.INFO, NotificationPriority.MEDIUM, 'Ticket Status Updated', `Your ticket ${ticket.id} status has been updated to ${status}`, { ticketId: ticket.id, status });
        }
        catch (error) {
            logger_1.logger.error('Error notifying user of status change:', error);
        }
    }
    async notifyAssignedUser(ticket, assignedTo) {
        try {
            await (0, notificationService_1.sendNotification)(assignedTo, NotificationType.INFO, NotificationPriority.MEDIUM, 'Ticket Assigned', `You have been assigned ticket ${ticket.id}: ${ticket.subject}`, { ticketId: ticket.id });
        }
        catch (error) {
            logger_1.logger.error('Error notifying assigned user:', error);
        }
    }
    async notifyCommentAdded(ticket, comment) {
        try {
            const recipients = [ticket.userId];
            if (ticket.assignedTo) {
                recipients.push(ticket.assignedTo);
            }
            for (const recipient of recipients) {
                await (0, notificationService_1.sendNotification)(recipient, NotificationType.INFO, NotificationPriority.MEDIUM, 'New Comment on Ticket', `New comment added to ticket ${ticket.id}`, { ticketId: ticket.id, commentId: comment.id });
            }
        }
        catch (error) {
            logger_1.logger.error('Error notifying users of comment:', error);
        }
    }
    async sendResolutionNotification(ticket, resolution) {
        try {
            await (0, emailService_1.sendEmail)({
                to: ticket.userId,
                subject: `Ticket Resolved - ${ticket.id}`,
                html: `Your ticket "${ticket.subject}" has been resolved: ${resolution}`,
                data: { ticket, resolution }
            });
        }
        catch (error) {
            logger_1.logger.error('Error sending resolution notification:', error);
        }
    }
}
exports.default = new SupportTicketService();
//# sourceMappingURL=supportTicketService.js.map