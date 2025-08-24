/**
 * Communication Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for communication management including internal messages, email templates, and notifications
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import { authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import logger from '@/utils/logger';
import { SQLQueries } from '@/utils/db_SQLQueries';

const db = new DatabaseService();

/**
 * Get internal messages with filtering and pagination
 * 
 * @route GET /api/v1/communication/messages
 * @access Private
 */
export const getInternalMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { 
      page = 1, 
      limit = 20, 
      search, 
      messageType, 
      priority, 
      senderId, 
      isUrgent 
    } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching internal messages', { userId, filters: req.query });

    const result = await db.query(SQLQueries.INTERNAL_MESSAGES.SEARCH, [
      search || null,
      messageType || null,
      priority || null,
      senderId || null,
      isUrgent || null,
      parseInt(limit as string),
      offset
    ]);

    const messages = result;

    // Get total count for pagination
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM internal_messages im
      JOIN users u ON im.sender_id = u.id
      WHERE ($1::text IS NULL OR im.subject ILIKE $1 OR im.content ILIKE $1)
      AND ($2::internal_message_type_enum IS NULL OR im.message_type = $2)
      AND ($3::internal_message_priority_enum IS NULL OR im.priority = $3)
      AND ($4::uuid IS NULL OR im.sender_id = $4)
      AND ($5::boolean IS NULL OR im.is_urgent = $5)
    `, [search || null, messageType || null, priority || null, senderId || null, isUrgent || null]);

    const total = parseInt(countResult[0]?.total || '0');
    const totalPages = Math.ceil(total / parseInt(limit as string));

    logger.info('Internal messages fetched successfully', { userId, count: messages.length });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching internal messages', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_MESSAGES_FETCH_ERROR',
        message: 'Failed to fetch internal messages'
      }
    });
  }
};

/**
 * Get internal message by ID
 * 
 * @route GET /api/v1/communication/messages/:id
 * @access Private
 */
export const getInternalMessageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Fetching internal message by ID', { userId, messageId: id });

    const result = await db.query(SQLQueries.INTERNAL_MESSAGES.GET_BY_ID, [id]);
    const message = result[0];

    if (!message) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTERNAL_MESSAGE_NOT_FOUND',
          message: 'Internal message not found'
        }
      });
    }

    // Get recipients
    const recipientsResult = await db.query(SQLQueries.MESSAGE_RECIPIENTS.GET_BY_MESSAGE_ID, [id]);
    const recipients = recipientsResult;

    logger.info('Internal message fetched successfully', { userId, messageId: id });

    return res.json({
      success: true,
      data: {
        message: {
          ...message,
          recipients
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching internal message', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_MESSAGE_FETCH_ERROR',
        message: 'Failed to fetch internal message'
      }
    });
  }
};

/**
 * Create new internal message
 * 
 * @route POST /api/v1/communication/messages
 * @access Private
 */
export const createInternalMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      subject,
      content,
      messageType,
      priority,
      isUrgent,
      requiresResponse,
      responseDeadline,
      recipients
    } = req.body;

    logger.info('Creating new internal message', { userId, subject, messageType });

    // Create message
    const messageResult = await db.query(SQLQueries.INTERNAL_MESSAGES.CREATE, [
      subject,
      content,
      userId,
      messageType || 'general',
      priority || 'normal',
      isUrgent || false,
      requiresResponse || false,
      responseDeadline || null
    ]);

    const message = messageResult[0];

    // Create recipients
    if (recipients && Array.isArray(recipients)) {
      for (const recipient of recipients) {
        await db.query(SQLQueries.MESSAGE_RECIPIENTS.CREATE, [
          message.id,
          recipient.userId || null,
          recipient.email,
          recipient.name,
          'unread'
        ]);
      }
    }

    logger.businessEvent('internal_message_created', 'internal_message', message.id, userId);

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    logger.error('Error creating internal message', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_MESSAGE_CREATE_ERROR',
        message: 'Failed to create internal message'
      }
    });
  }
};

/**
 * Update internal message
 * 
 * @route PUT /api/v1/communication/messages/:id
 * @access Private
 */
export const updateInternalMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      subject,
      content,
      messageType,
      priority,
      isUrgent,
      requiresResponse,
      responseDeadline
    } = req.body;

    logger.info('Updating internal message', { userId, messageId: id });

    // Get current message
    const currentResult = await db.query(SQLQueries.INTERNAL_MESSAGES.GET_BY_ID, [id]);
    const currentMessage = currentResult[0];

    if (!currentMessage) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTERNAL_MESSAGE_NOT_FOUND',
          message: 'Internal message not found'
        }
      });
    }

    // Update message
    const result = await db.query(SQLQueries.INTERNAL_MESSAGES.UPDATE, [
      id,
      subject || currentMessage.subject,
      content || currentMessage.content,
      messageType || currentMessage.message_type,
      priority || currentMessage.priority,
      isUrgent !== undefined ? isUrgent : currentMessage.is_urgent,
      requiresResponse !== undefined ? requiresResponse : currentMessage.requires_response,
      responseDeadline || currentMessage.response_deadline
    ]);

    const updatedMessage = result[0];

    logger.businessEvent('internal_message_updated', 'internal_message', id, userId);

    return res.json({
      success: true,
      data: { message: updatedMessage }
    });
  } catch (error) {
    logger.error('Error updating internal message', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_MESSAGE_UPDATE_ERROR',
        message: 'Failed to update internal message'
      }
    });
  }
};

/**
 * Delete internal message
 * 
 * @route DELETE /api/v1/communication/messages/:id
 * @access Private
 */
export const deleteInternalMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Deleting internal message', { userId, messageId: id });

    // Check if message exists
    const currentResult = await db.query(SQLQueries.INTERNAL_MESSAGES.GET_BY_ID, [id]);
    const message = currentResult[0];

    if (!message) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTERNAL_MESSAGE_NOT_FOUND',
          message: 'Internal message not found'
        }
      });
    }

    // Delete message (cascade will delete recipients)
    await db.query(SQLQueries.INTERNAL_MESSAGES.DELETE, [id]);

    logger.businessEvent('internal_message_deleted', 'internal_message', id, userId);

    return res.json({
      success: true,
      message: 'Internal message deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting internal message', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_MESSAGE_DELETE_ERROR',
        message: 'Failed to delete internal message'
      }
    });
  }
};

/**
 * Get user's received messages
 * 
 * @route GET /api/v1/communication/messages/received
 * @access Private
 */
export const getReceivedMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching received messages', { userId });

    const result = await db.query(SQLQueries.MESSAGE_RECIPIENTS.GET_BY_RECIPIENT_ID, [
      userId,
      parseInt(limit as string),
      offset
    ]);

    const messages = result;

    // Get unread count
    const unreadResult = await db.query(SQLQueries.MESSAGE_RECIPIENTS.GET_UNREAD_COUNT, [userId]);
    const unreadCount = parseInt(unreadResult[0]?.unread_count || '0');

    logger.info('Received messages fetched successfully', { userId, count: messages.length, unreadCount });

    res.json({
      success: true,
      data: { 
        messages,
        unreadCount,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching received messages', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RECEIVED_MESSAGES_FETCH_ERROR',
        message: 'Failed to fetch received messages'
      }
    });
  }
};

/**
 * Mark message as read/responded
 * 
 * @route PUT /api/v1/communication/messages/:id/status
 * @access Private
 */
export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const { status, responseContent } = req.body;

    logger.info('Updating message status', { userId, messageId: id, status });

    const readAt = status === 'read' ? new Date() : null;
    const respondedAt = status === 'responded' ? new Date() : null;

    const result = await db.query(SQLQueries.MESSAGE_RECIPIENTS.UPDATE_STATUS, [
      id,
      status,
      readAt,
      respondedAt,
      responseContent || null
    ]);

    const updatedRecipient = result[0];

    logger.businessEvent('message_status_updated', 'message_recipient', id, userId);

    res.json({
      success: true,
      data: { recipient: updatedRecipient }
    });
  } catch (error) {
    logger.error('Error updating message status', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MESSAGE_STATUS_UPDATE_ERROR',
        message: 'Failed to update message status'
      }
    });
  }
};

/**
 * Get email templates
 * 
 * @route GET /api/v1/communication/email-templates
 * @access Private
 */
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { search, templateType, isActive, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching email templates', { userId, filters: req.query });

    const result = await db.query(SQLQueries.EMAIL_TEMPLATES.SEARCH, [
      search || null,
      templateType || null,
      isActive !== undefined ? isActive : null,
      parseInt(limit as string),
      offset
    ]);

    const templates = result;

    logger.info('Email templates fetched successfully', { userId, count: templates.length });

    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    logger.error('Error fetching email templates', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_TEMPLATES_FETCH_ERROR',
        message: 'Failed to fetch email templates'
      }
    });
  }
};

/**
 * Create email template
 * 
 * @route POST /api/v1/communication/email-templates
 * @access Private
 */
export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      name,
      subject,
      content,
      templateType,
      variables
    } = req.body;

    logger.info('Creating email template', { userId, name, templateType });

    const result = await db.query(SQLQueries.EMAIL_TEMPLATES.CREATE, [
      name,
      subject,
      content,
      templateType,
      variables || {},
      userId
    ]);

    const template = result[0];

    logger.businessEvent('email_template_created', 'email_template', template.id, userId);

    res.status(201).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    logger.error('Error creating email template', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_TEMPLATE_CREATE_ERROR',
        message: 'Failed to create email template'
      }
    });
  }
};

/**
 * Update email template
 * 
 * @route PUT /api/v1/communication/email-templates/:id
 * @access Private
 */
export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      name,
      subject,
      content,
      templateType,
      variables,
      isActive
    } = req.body;

    logger.info('Updating email template', { userId, templateId: id });

    const result = await db.query(SQLQueries.EMAIL_TEMPLATES.UPDATE, [
      id,
      name,
      subject,
      content,
      templateType,
      variables || {},
      isActive !== undefined ? isActive : true
    ]);

    const template = result[0];

    logger.businessEvent('email_template_updated', 'email_template', id, userId);

    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    logger.error('Error updating email template', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_TEMPLATE_UPDATE_ERROR',
        message: 'Failed to update email template'
      }
    });
  }
};

export default {
  getInternalMessages,
  getInternalMessageById,
  createInternalMessage,
  updateInternalMessage,
  deleteInternalMessage,
  getReceivedMessages,
  updateMessageStatus,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate
};