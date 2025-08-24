/**
 * Support Ticket Service
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This service provides comprehensive support ticket management
 * including ticket creation, tracking, assignment, and resolution for the
 * legal practice management system.
 */

import { DatabaseService } from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import { SQLQueries } from '@/utils/db_SQLQueries';
import { UserRole, hasPermission } from '@/utils/roleAccess';
import { sendEmail } from '../utils/emailService';
import { sendNotification } from '../utils/notificationService';

const db = new DatabaseService();

/**
 * Support ticket priority levels
 */
export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Support ticket status
 */
export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

/**
 * Support ticket categories
 */
export enum TicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  TRAINING = 'training',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  GENERAL = 'general'
}

/**
 * Support ticket interface
 */
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  attachments?: string[];
  tags?: string[];
  estimatedResolutionTime?: Date;
  actualResolutionTime?: Date;
  userSatisfaction?: number;
  internalNotes?: string;
}

/**
 * Support ticket comment interface
 */
export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Support ticket statistics interface
 */
export interface TicketStatistics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  userSatisfaction: number;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByStatus: Record<TicketStatus, number>;
}

/**
 * Support Ticket Service Class
 */
class SupportTicketService {
  /**
   * Create a new support ticket
   * @param ticketData - The ticket data
   * @param userId - The user creating the ticket
   * @returns Promise<SupportTicket>
   */
  async createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<SupportTicket> {
    try {
      logger.info('Creating support ticket', { userId, subject: ticketData.subject });

      const ticket: SupportTicket = {
        id: this.generateTicketId(),
        ...ticketData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.query(SQLQueries.SUPPORT.CREATE_TICKET, [
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

      // Send notification to support team
      await this.notifySupportTeam(ticket);

      // Send confirmation email to user
      await this.sendTicketConfirmation(ticket);

      logger.info('Support ticket created successfully', { ticketId: ticket.id });
      return ticket;
    } catch (error) {
      logger.error('Error creating support ticket:', error as Error);
      throw error;
    }
  }

  /**
   * Get ticket by ID
   * @param ticketId - The ticket ID
   * @param userId - The requesting user ID
   * @returns Promise<SupportTicket | null>
   */
  async getTicketById(ticketId: string, userId: string): Promise<SupportTicket | null> {
    try {
      const result = await db.query(SQLQueries.SUPPORT.GET_TICKET_BY_ID, [ticketId]);
      
      if (result.length === 0) {
        return null;
      }

      const ticket = this.mapTicketFromRow(result[0]);
      
      // Check if user has permission to view this ticket
      if (!this.canUserAccessTicket(ticket, userId)) {
        logger.warn('Unauthorized ticket access attempt', { ticketId, userId });
        throw new Error('Unauthorized access to ticket');
      }

      return ticket;
    } catch (error) {
      logger.error('Error getting ticket by ID:', error as Error);
      throw error;
    }
  }

  /**
   * Get tickets for a user
   * @param userId - The user ID
   * @param filters - Optional filters
   * @returns Promise<SupportTicket[]>
   */
  async getUserTickets(userId: string, filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    limit?: number;
    offset?: number;
  }): Promise<SupportTicket[]> {
    try {
      let query = SQLQueries.SUPPORT.GET_USER_TICKETS;
      const params: any[] = [userId];

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
      return result.map((row: any) => this.mapTicketFromRow(row));
    } catch (error) {
      logger.error('Error getting user tickets:', error as Error);
      throw error;
    }
  }

  /**
   * Get all tickets (for support team)
   * @param userId - The requesting user ID
   * @param filters - Optional filters
   * @returns Promise<SupportTicket[]>
   */
  async getAllTickets(userId: string, filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<SupportTicket[]> {
    try {
      // Check if user has permission to view all tickets
      if (!hasPermission(UserRole.SUPER_ADMIN, 'support:read_all')) {
        throw new Error('Unauthorized access to all tickets');
      }

      let query = SQLQueries.SUPPORT.GET_ALL_TICKETS;
      const params: any[] = [];

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
      return result.map((row: any) => this.mapTicketFromRow(row));
    } catch (error) {
      logger.error('Error getting all tickets:', error as Error);
      throw error;
    }
  }

  /**
   * Update ticket status
   * @param ticketId - The ticket ID
   * @param status - The new status
   * @param userId - The user updating the ticket
   * @returns Promise<SupportTicket>
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus, userId: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicketById(ticketId, userId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if user has permission to update ticket
      if (!this.canUserUpdateTicket(ticket, userId)) {
        throw new Error('Unauthorized to update ticket');
      }

      const updatedAt = new Date();
      let resolvedAt = ticket.resolvedAt;

      if (status === TicketStatus.RESOLVED && !resolvedAt) {
        resolvedAt = new Date();
      }

      await db.query(SQLQueries.SUPPORT.UPDATE_TICKET_STATUS, [
        ticketId,
        status,
        updatedAt,
        resolvedAt
      ]);

      // Send notification to user
      await this.notifyUserOfStatusChange(ticket, status);

      logger.info('Ticket status updated', { ticketId, status, userId });
      
      return await this.getTicketById(ticketId, userId) as SupportTicket;
    } catch (error) {
      logger.error('Error updating ticket status:', error as Error);
      throw error;
    }
  }

  /**
   * Assign ticket to support team member
   * @param ticketId - The ticket ID
   * @param assignedTo - The user ID to assign to
   * @param userId - The user making the assignment
   * @returns Promise<SupportTicket>
   */
  async assignTicket(ticketId: string, assignedTo: string, userId: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicketById(ticketId, userId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if user has permission to assign tickets
      if (!hasPermission(UserRole.SUPER_ADMIN, 'support:assign')) {
        throw new Error('Unauthorized to assign tickets');
      }

      await db.query(SQLQueries.SUPPORT.ASSIGN_TICKET, [
        ticketId,
        assignedTo,
        new Date()
      ]);

      // Send notification to assigned user
      await this.notifyAssignedUser(ticket, assignedTo);

      logger.info('Ticket assigned', { ticketId, assignedTo, userId });
      
      return await this.getTicketById(ticketId, userId) as SupportTicket;
    } catch (error) {
      logger.error('Error assigning ticket:', error as Error);
      throw error;
    }
  }

  /**
   * Add comment to ticket
   * @param ticketId - The ticket ID
   * @param comment - The comment data
   * @param userId - The user adding the comment
   * @returns Promise<TicketComment>
   */
  async addComment(ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<TicketComment> {
    try {
      const ticket = await this.getTicketById(ticketId, userId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if user has permission to comment on this ticket
      if (!this.canUserAccessTicket(ticket, userId)) {
        throw new Error('Unauthorized to comment on ticket');
      }

      const ticketComment: TicketComment = {
        id: this.generateCommentId(),
        ...comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.query(SQLQueries.SUPPORT.ADD_COMMENT, [
        ticketComment.id,
        ticketId,
        ticketComment.userId,
        ticketComment.comment,
        ticketComment.isInternal,
        ticketComment.createdAt,
        ticketComment.updatedAt
      ]);

      // Send notification to relevant users
      await this.notifyCommentAdded(ticket, ticketComment);

      logger.info('Comment added to ticket', { ticketId, commentId: ticketComment.id, userId });
      return ticketComment;
    } catch (error) {
      logger.error('Error adding comment to ticket:', error as Error);
      throw error;
    }
  }

  /**
   * Get ticket statistics
   * @param userId - The requesting user ID
   * @param filters - Optional filters
   * @returns Promise<TicketStatistics>
   */
  async getTicketStatistics(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: TicketCategory;
  }): Promise<TicketStatistics> {
    try {
      // Check if user has permission to view statistics
      if (!hasPermission(UserRole.SUPER_ADMIN, 'support:view_stats')) {
        throw new Error('Unauthorized to view ticket statistics');
      }

      const result = await db.query(SQLQueries.SUPPORT.GET_TICKET_STATISTICS, [
        filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        filters?.endDate || new Date(),
        filters?.category || null
      ]);

      return this.mapStatisticsFromRow(result[0]);
    } catch (error) {
      logger.error('Error getting ticket statistics:', error as Error);
      throw error;
    }
  }

  /**
   * Resolve ticket with resolution
   * @param ticketId - The ticket ID
   * @param resolution - The resolution text
   * @param userId - The user resolving the ticket
   * @returns Promise<SupportTicket>
   */
  async resolveTicket(ticketId: string, resolution: string, userId: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicketById(ticketId, userId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if user has permission to resolve tickets
      if (!this.canUserUpdateTicket(ticket, userId)) {
        throw new Error('Unauthorized to resolve ticket');
      }

      await db.query(SQLQueries.SUPPORT.RESOLVE_TICKET, [
        ticketId,
        TicketStatus.RESOLVED,
        resolution,
        new Date(),
        new Date()
      ]);

      // Send resolution notification to user
      await this.sendResolutionNotification(ticket, resolution);

      logger.info('Ticket resolved', { ticketId, userId });
      
      return await this.getTicketById(ticketId, userId) as SupportTicket;
    } catch (error) {
      logger.error('Error resolving ticket:', error as Error);
      throw error;
    }
  }

  /**
   * Rate ticket satisfaction
   * @param ticketId - The ticket ID
   * @param rating - The satisfaction rating (1-5)
   * @param userId - The user rating the ticket
   * @returns Promise<void>
   */
  async rateTicketSatisfaction(ticketId: string, rating: number, userId: string): Promise<void> {
    try {
      const ticket = await this.getTicketById(ticketId, userId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if user is the ticket creator
      if (ticket.userId !== userId) {
        throw new Error('Only ticket creator can rate satisfaction');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      await db.query(SQLQueries.SUPPORT.RATE_TICKET_SATISFACTION, [
        ticketId,
        rating,
        new Date()
      ]);

      logger.info('Ticket satisfaction rated', { ticketId, rating, userId });
    } catch (error) {
      logger.error('Error rating ticket satisfaction:', error as Error);
      throw error;
    }
  }

  /**
   * Generate unique ticket ID
   * @returns string
   */
  private generateTicketId(): string {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique comment ID
   * @returns string
   */
  private generateCommentId(): string {
    return `COM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if user can access ticket
   * @param ticket - The ticket
   * @param userId - The user ID
   * @returns boolean
   */
  private canUserAccessTicket(ticket: SupportTicket, userId: string): boolean {
    return ticket.userId === userId || 
           ticket.assignedTo === userId ||
           hasPermission(UserRole.SUPER_ADMIN, 'support:read_all');
  }

  /**
   * Check if user can update ticket
   * @param ticket - The ticket
   * @param userId - The user ID
   * @returns boolean
   */
  private canUserUpdateTicket(ticket: SupportTicket, userId: string): boolean {
    return ticket.assignedTo === userId ||
           hasPermission(UserRole.SUPER_ADMIN, 'support:update');
  }

  /**
   * Map database row to ticket object
   * @param row - Database row
   * @returns SupportTicket
   */
  private mapTicketFromRow(row: any): SupportTicket {
    return {
      id: row.id,
      userId: row.user_id,
      subject: row.subject,
      description: row.description,
      priority: row.priority as TicketPriority,
      status: row.status as TicketStatus,
      category: row.category as TicketCategory,
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

  /**
   * Map database row to statistics object
   * @param row - Database row
   * @returns TicketStatistics
   */
  private mapStatisticsFromRow(row: any): TicketStatistics {
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

  /**
   * Notify support team of new ticket
   * @param ticket - The ticket
   */
  private async notifySupportTeam(ticket: SupportTicket): Promise<void> {
    try {
      await sendNotification({
        type: 'support_ticket_created',
        title: 'New Support Ticket',
        message: `New ${ticket.priority} priority ticket: ${ticket.subject}`,
        recipients: ['support-team'],
        data: { ticketId: ticket.id }
      });
    } catch (error) {
      logger.error('Error notifying support team:', error as Error);
    }
  }

  /**
   * Send ticket confirmation email
   * @param ticket - The ticket
   */
  private async sendTicketConfirmation(ticket: SupportTicket): Promise<void> {
    try {
      await sendEmail({
        to: ticket.userId,
        subject: `Support Ticket Created - ${ticket.id}`,
        template: 'ticket-confirmation',
        data: { ticket }
      });
    } catch (error) {
      logger.error('Error sending ticket confirmation:', error as Error);
    }
  }

  /**
   * Notify user of status change
   * @param ticket - The ticket
   * @param status - The new status
   */
  private async notifyUserOfStatusChange(ticket: SupportTicket, status: TicketStatus): Promise<void> {
    try {
      await sendNotification({
        type: 'ticket_status_changed',
        title: 'Ticket Status Updated',
        message: `Your ticket ${ticket.id} status has been updated to ${status}`,
        recipients: [ticket.userId],
        data: { ticketId: ticket.id, status }
      });
    } catch (error) {
      logger.error('Error notifying user of status change:', error as Error);
    }
  }

  /**
   * Notify assigned user
   * @param ticket - The ticket
   * @param assignedTo - The assigned user ID
   */
  private async notifyAssignedUser(ticket: SupportTicket, assignedTo: string): Promise<void> {
    try {
      await sendNotification({
        type: 'ticket_assigned',
        title: 'Ticket Assigned',
        message: `You have been assigned ticket ${ticket.id}: ${ticket.subject}`,
        recipients: [assignedTo],
        data: { ticketId: ticket.id }
      });
    } catch (error) {
      logger.error('Error notifying assigned user:', error as Error);
    }
  }

  /**
   * Notify users of new comment
   * @param ticket - The ticket
   * @param comment - The comment
   */
  private async notifyCommentAdded(ticket: SupportTicket, comment: TicketComment): Promise<void> {
    try {
      const recipients = [ticket.userId];
      if (ticket.assignedTo) {
        recipients.push(ticket.assignedTo);
      }

      await sendNotification({
        type: 'ticket_comment_added',
        title: 'New Comment on Ticket',
        message: `New comment added to ticket ${ticket.id}`,
        recipients,
        data: { ticketId: ticket.id, commentId: comment.id }
      });
    } catch (error) {
      logger.error('Error notifying users of comment:', error as Error);
    }
  }

  /**
   * Send resolution notification
   * @param ticket - The ticket
   * @param resolution - The resolution
   */
  private async sendResolutionNotification(ticket: SupportTicket, resolution: string): Promise<void> {
    try {
      await sendEmail({
        to: ticket.userId,
        subject: `Ticket Resolved - ${ticket.id}`,
        template: 'ticket-resolved',
        data: { ticket, resolution }
      });
    } catch (error) {
      logger.error('Error sending resolution notification:', error as Error);
    }
  }
}

export default new SupportTicketService();