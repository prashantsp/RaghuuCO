/**
 * Communication Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description API routes for communication functionality including internal messages and email templates
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import communicationController from '@/controllers/communicationController';

const router = Router();

/**
 * @route GET /api/v1/communication/messages
 * @desc Get all internal messages with filtering and pagination
 * @access Private
 */
router.get('/messages', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_COMMUNICATION),
  communicationController.getInternalMessages
);

/**
 * @route GET /api/v1/communication/messages/received
 * @desc Get user's received messages
 * @access Private
 */
router.get('/messages/received', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_COMMUNICATION),
  communicationController.getReceivedMessages
);

/**
 * @route GET /api/v1/communication/messages/:id
 * @desc Get internal message by ID
 * @access Private
 */
router.get('/messages/:id', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_COMMUNICATION),
  communicationController.getInternalMessageById
);

/**
 * @route POST /api/v1/communication/messages
 * @desc Create new internal message
 * @access Private
 */
router.post('/messages', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_COMMUNICATION),
  communicationController.createInternalMessage
);

/**
 * @route PUT /api/v1/communication/messages/:id
 * @desc Update internal message
 * @access Private
 */
router.put('/messages/:id', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_COMMUNICATION),
  communicationController.updateInternalMessage
);

/**
 * @route DELETE /api/v1/communication/messages/:id
 * @desc Delete internal message
 * @access Private
 */
router.delete('/messages/:id', 
  authenticateToken, 
  authorizePermission(Permission.DELETE_COMMUNICATION),
  communicationController.deleteInternalMessage
);

/**
 * @route PUT /api/v1/communication/messages/:id/status
 * @desc Update message status (read/responded)
 * @access Private
 */
router.put('/messages/:id/status', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_COMMUNICATION),
  communicationController.updateMessageStatus
);

/**
 * @route GET /api/v1/communication/email-templates
 * @desc Get email templates
 * @access Private
 */
router.get('/email-templates', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_COMMUNICATION),
  communicationController.getEmailTemplates
);

/**
 * @route POST /api/v1/communication/email-templates
 * @desc Create email template
 * @access Private
 */
router.post('/email-templates', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_COMMUNICATION),
  communicationController.createEmailTemplate
);

/**
 * @route PUT /api/v1/communication/email-templates/:id
 * @desc Update email template
 * @access Private
 */
router.put('/email-templates/:id', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_EVENTS), // Using events permission for now
  communicationController.updateEmailTemplate
);

export default router;