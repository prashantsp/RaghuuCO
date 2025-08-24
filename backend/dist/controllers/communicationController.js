"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmailTemplate = exports.createEmailTemplate = exports.getEmailTemplates = exports.updateMessageStatus = exports.getReceivedMessages = exports.deleteInternalMessage = exports.updateInternalMessage = exports.createInternalMessage = exports.getInternalMessageById = exports.getInternalMessages = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.default();
const getInternalMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, search, messageType, priority, senderId, isUrgent } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching internal messages', { userId, filters: req.query });
        const result = await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.SEARCH, [
            search || null,
            messageType || null,
            priority || null,
            senderId || null,
            isUrgent || null,
            parseInt(limit),
            offset
        ]);
        const messages = result;
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
        const totalPages = Math.ceil(total / parseInt(limit));
        logger_1.default.info('Internal messages fetched successfully', { userId, count: messages.length });
        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching internal messages', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_MESSAGES_FETCH_ERROR',
                message: 'Failed to fetch internal messages'
            }
        });
    }
};
exports.getInternalMessages = getInternalMessages;
const getInternalMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Fetching internal message by ID', { userId, messageId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.GET_BY_ID, [id]);
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
        const recipientsResult = await db.query(db_SQLQueries_1.SQLQueries.MESSAGE_RECIPIENTS.GET_BY_MESSAGE_ID, [id]);
        const recipients = recipientsResult;
        logger_1.default.info('Internal message fetched successfully', { userId, messageId: id });
        res.json({
            success: true,
            data: {
                message: {
                    ...message,
                    recipients
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching internal message', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_MESSAGE_FETCH_ERROR',
                message: 'Failed to fetch internal message'
            }
        });
    }
};
exports.getInternalMessageById = getInternalMessageById;
const createInternalMessage = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { subject, content, messageType, priority, isUrgent, requiresResponse, responseDeadline, recipients } = req.body;
        logger_1.default.info('Creating new internal message', { userId, subject, messageType });
        const messageResult = await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.CREATE, [
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
        if (recipients && Array.isArray(recipients)) {
            for (const recipient of recipients) {
                await db.query(db_SQLQueries_1.SQLQueries.MESSAGE_RECIPIENTS.CREATE, [
                    message.id,
                    recipient.userId || null,
                    recipient.email,
                    recipient.name,
                    'unread'
                ]);
            }
        }
        logger_1.default.businessEvent('internal_message_created', 'internal_message', message.id, userId);
        res.status(201).json({
            success: true,
            data: { message }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating internal message', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_MESSAGE_CREATE_ERROR',
                message: 'Failed to create internal message'
            }
        });
    }
};
exports.createInternalMessage = createInternalMessage;
const updateInternalMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { subject, content, messageType, priority, isUrgent, requiresResponse, responseDeadline } = req.body;
        logger_1.default.info('Updating internal message', { userId, messageId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.GET_BY_ID, [id]);
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
        const result = await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.UPDATE, [
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
        logger_1.default.businessEvent('internal_message_updated', 'internal_message', id, userId);
        res.json({
            success: true,
            data: { message: updatedMessage }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating internal message', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_MESSAGE_UPDATE_ERROR',
                message: 'Failed to update internal message'
            }
        });
    }
};
exports.updateInternalMessage = updateInternalMessage;
const deleteInternalMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Deleting internal message', { userId, messageId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.GET_BY_ID, [id]);
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
        await db.query(db_SQLQueries_1.SQLQueries.INTERNAL_MESSAGES.DELETE, [id]);
        logger_1.default.businessEvent('internal_message_deleted', 'internal_message', id, userId);
        res.json({
            success: true,
            message: 'Internal message deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting internal message', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_MESSAGE_DELETE_ERROR',
                message: 'Failed to delete internal message'
            }
        });
    }
};
exports.deleteInternalMessage = deleteInternalMessage;
const getReceivedMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching received messages', { userId });
        const result = await db.query(db_SQLQueries_1.SQLQueries.MESSAGE_RECIPIENTS.GET_BY_RECIPIENT_ID, [
            userId,
            parseInt(limit),
            offset
        ]);
        const messages = result;
        const unreadResult = await db.query(db_SQLQueries_1.SQLQueries.MESSAGE_RECIPIENTS.GET_UNREAD_COUNT, [userId]);
        const unreadCount = parseInt(unreadResult[0]?.unread_count || '0');
        logger_1.default.info('Received messages fetched successfully', { userId, count: messages.length, unreadCount });
        res.json({
            success: true,
            data: {
                messages,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching received messages', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'RECEIVED_MESSAGES_FETCH_ERROR',
                message: 'Failed to fetch received messages'
            }
        });
    }
};
exports.getReceivedMessages = getReceivedMessages;
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { status, responseContent } = req.body;
        logger_1.default.info('Updating message status', { userId, messageId: id, status });
        const readAt = status === 'read' ? new Date() : null;
        const respondedAt = status === 'responded' ? new Date() : null;
        const result = await db.query(db_SQLQueries_1.SQLQueries.MESSAGE_RECIPIENTS.UPDATE_STATUS, [
            id,
            status,
            readAt,
            respondedAt,
            responseContent || null
        ]);
        const updatedRecipient = result[0];
        logger_1.default.businessEvent('message_status_updated', 'message_recipient', id, userId);
        res.json({
            success: true,
            data: { recipient: updatedRecipient }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating message status', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MESSAGE_STATUS_UPDATE_ERROR',
                message: 'Failed to update message status'
            }
        });
    }
};
exports.updateMessageStatus = updateMessageStatus;
const getEmailTemplates = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { search, templateType, isActive, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching email templates', { userId, filters: req.query });
        const result = await db.query(db_SQLQueries_1.SQLQueries.EMAIL_TEMPLATES.SEARCH, [
            search || null,
            templateType || null,
            isActive !== undefined ? isActive : null,
            parseInt(limit),
            offset
        ]);
        const templates = result;
        logger_1.default.info('Email templates fetched successfully', { userId, count: templates.length });
        res.json({
            success: true,
            data: { templates }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching email templates', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EMAIL_TEMPLATES_FETCH_ERROR',
                message: 'Failed to fetch email templates'
            }
        });
    }
};
exports.getEmailTemplates = getEmailTemplates;
const createEmailTemplate = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, subject, content, templateType, variables } = req.body;
        logger_1.default.info('Creating email template', { userId, name, templateType });
        const result = await db.query(db_SQLQueries_1.SQLQueries.EMAIL_TEMPLATES.CREATE, [
            name,
            subject,
            content,
            templateType,
            variables || {},
            userId
        ]);
        const template = result[0];
        logger_1.default.businessEvent('email_template_created', 'email_template', template.id, userId);
        res.status(201).json({
            success: true,
            data: { template }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating email template', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EMAIL_TEMPLATE_CREATE_ERROR',
                message: 'Failed to create email template'
            }
        });
    }
};
exports.createEmailTemplate = createEmailTemplate;
const updateEmailTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { name, subject, content, templateType, variables, isActive } = req.body;
        logger_1.default.info('Updating email template', { userId, templateId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.EMAIL_TEMPLATES.UPDATE, [
            id,
            name,
            subject,
            content,
            templateType,
            variables || {},
            isActive !== undefined ? isActive : true
        ]);
        const template = result[0];
        logger_1.default.businessEvent('email_template_updated', 'email_template', id, userId);
        res.json({
            success: true,
            data: { template }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating email template', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EMAIL_TEMPLATE_UPDATE_ERROR',
                message: 'Failed to update email template'
            }
        });
    }
};
exports.updateEmailTemplate = updateEmailTemplate;
exports.default = {
    getInternalMessages: exports.getInternalMessages,
    getInternalMessageById: exports.getInternalMessageById,
    createInternalMessage: exports.createInternalMessage,
    updateInternalMessage: exports.updateInternalMessage,
    deleteInternalMessage: exports.deleteInternalMessage,
    getReceivedMessages: exports.getReceivedMessages,
    updateMessageStatus: exports.updateMessageStatus,
    getEmailTemplates: exports.getEmailTemplates,
    createEmailTemplate: exports.createEmailTemplate,
    updateEmailTemplate: exports.updateEmailTemplate
};
//# sourceMappingURL=communicationController.js.map