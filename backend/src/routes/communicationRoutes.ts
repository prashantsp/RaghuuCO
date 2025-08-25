/**
 * Communication Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for communication functionality including internal messages and email templates
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getInternalMessages,
  getReceivedMessages,
  getInternalMessageById,
  createInternalMessage,
  updateInternalMessage,
  deleteInternalMessage,
  updateMessageStatus,
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate
} from '@/controllers/communicationController';

const router = Router();

/**
 * @route GET /api/v1/communication/messages
 * @desc Get all internal messages with filtering and pagination
 * @access Private
 */
router.get('/messages', 
  authenticateToken, 
  getInternalMessages
);

/**
 * @route GET /api/v1/communication/messages/received
 * @desc Get user's received messages
 * @access Private
 */
router.get('/messages/received', 
  authenticateToken, 
  getReceivedMessages
);

/**
 * @route GET /api/v1/communication/messages/:id
 * @desc Get internal message by ID
 * @access Private
 */
router.get('/messages/:id', 
  authenticateToken, 
  getInternalMessageById
);

/**
 * @route POST /api/v1/communication/messages
 * @desc Create new internal message
 * @access Private
 */
router.post('/messages', 
  authenticateToken, 
  createInternalMessage
);

/**
 * @route PUT /api/v1/communication/messages/:id
 * @desc Update internal message
 * @access Private
 */
router.put('/messages/:id', 
  authenticateToken, 
  updateInternalMessage
);

/**
 * @route DELETE /api/v1/communication/messages/:id
 * @desc Delete internal message
 * @access Private
 */
router.delete('/messages/:id', 
  authenticateToken, 
  deleteInternalMessage
);

/**
 * @route PUT /api/v1/communication/messages/:id/status
 * @desc Update message status (read/responded)
 * @access Private
 */
router.put('/messages/:id/status', 
  authenticateToken, 
  updateMessageStatus
);

/**
 * @route GET /api/v1/communication/email-templates
 * @desc Get email templates
 * @access Private
 */
router.get('/email-templates', 
  authenticateToken, 
  getEmailTemplates
);

/**
 * @route POST /api/v1/communication/email-templates
 * @desc Create email template
 * @access Private
 */
router.post('/email-templates', 
  authenticateToken, 
  createEmailTemplate
);

/**
 * @route PUT /api/v1/communication/email-templates/:id
 * @desc Update email template
 * @access Private
 */
router.put('/email-templates/:id', 
  authenticateToken, 
  updateEmailTemplate
);

export default router;