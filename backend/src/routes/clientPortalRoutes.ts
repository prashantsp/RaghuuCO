/**
 * Client Portal Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for client portal functionality including authentication, case access, and messaging
 */

import { Router } from 'express';
import { authenticateClientUser, clientPortalRateLimit, validateCaseAccess, logClientActivity } from '@/middleware/clientPortalAuth';
import clientPortalController from '@/controllers/clientPortalController';

const router = Router();

// Apply rate limiting to all client portal routes
router.use(clientPortalRateLimit);

/**
 * @route POST /api/v1/client-portal/register
 * @desc Register new client portal user
 * @access Public
 */
router.post('/register', 
  logClientActivity('client_registration'),
  clientPortalController.registerClientUser
);

/**
 * @route POST /api/v1/client-portal/login
 * @desc Client portal user login
 * @access Public
 */
router.post('/login', 
  logClientActivity('client_login'),
  clientPortalController.loginClientUser
);

/**
 * @route POST /api/v1/client-portal/logout
 * @desc Client portal user logout
 * @access Private (Client)
 */
router.post('/logout', 
  authenticateClientUser,
  logClientActivity('client_logout'),
  clientPortalController.logoutClientUser
);

/**
 * @route GET /api/v1/client-portal/cases
 * @desc Get client cases
 * @access Private (Client)
 */
router.get('/cases', 
  authenticateClientUser,
  logClientActivity('view_cases'),
  clientPortalController.getClientCases
);

/**
 * @route GET /api/v1/client-portal/cases/:id
 * @desc Get client case details
 * @access Private (Client)
 */
router.get('/cases/:id', 
  authenticateClientUser,
  validateCaseAccess,
  logClientActivity('view_case_details'),
  clientPortalController.getClientCaseDetails
);

/**
 * @route GET /api/v1/client-portal/messages
 * @desc Get client messages
 * @access Private (Client)
 */
router.get('/messages', 
  authenticateClientUser,
  logClientActivity('view_messages'),
  clientPortalController.getClientMessages
);

/**
 * @route POST /api/v1/client-portal/messages
 * @desc Send client message
 * @access Private (Client)
 */
router.post('/messages', 
  authenticateClientUser,
  logClientActivity('send_message'),
  clientPortalController.sendClientMessage
);

/**
 * @route PUT /api/v1/client-portal/profile
 * @desc Update client profile
 * @access Private (Client)
 */
router.put('/profile', 
  authenticateClientUser,
  logClientActivity('update_profile'),
  clientPortalController.updateClientProfile
);

export default router;