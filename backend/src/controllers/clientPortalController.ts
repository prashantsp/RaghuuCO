/**
 * Client Portal Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Controller for client portal functionality including authentication, case access, and messaging
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Client portal user registration
 * 
 * @route POST /api/v1/client-portal/register
 * @access Public
 */
export const registerClientUser = async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      email,
      password,
      firstName,
      lastName,
      phone
    } = req.body;

    logger.info('Client portal user registration', { email, clientId });

    // Check if email already exists
    const existingUser = await db.query(SQLQueries.CLIENT_PORTAL_USERS.GET_BY_EMAIL, [email]);
    if (existingUser.rows[0]) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already registered'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create client portal user
    const result = await db.query(SQLQueries.CLIENT_PORTAL_USERS.CREATE, [
      clientId,
      email,
      passwordHash,
      firstName,
      lastName,
      phone || null
    ]);

    const clientUser = result.rows[0];

    logger.businessEvent('client_portal_user_registered', 'client_portal_user', clientUser.id, null);

    res.status(201).json({
      success: true,
      data: { 
        user: {
          id: clientUser.id,
          email: clientUser.email,
          firstName: clientUser.first_name,
          lastName: clientUser.last_name
        }
      }
    });
  } catch (error) {
    logger.error('Error registering client portal user', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_REGISTRATION_ERROR',
        message: 'Failed to register client portal user'
      }
    });
  }
};

/**
 * Client portal user login
 * 
 * @route POST /api/v1/client-portal/login
 * @access Public
 */
export const loginClientUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    logger.info('Client portal user login attempt', { email });

    // Get user by email
    const userResult = await db.query(SQLQueries.CLIENT_PORTAL_USERS.GET_BY_EMAIL, [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if account is locked
    if (user.account_locked_until && new Date() < user.account_locked_until) {
      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Update failed login attempts
      const failedAttempts = user.failed_login_attempts + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 minutes

      await db.query(SQLQueries.CLIENT_PORTAL_USERS.UPDATE_LOGIN_ATTEMPTS, [
        user.id,
        failedAttempts,
        lockUntil,
        user.last_login
      ]);

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Reset failed login attempts
    await db.query(SQLQueries.CLIENT_PORTAL_USERS.UPDATE_LOGIN_ATTEMPTS, [
      user.id,
      0,
      null,
      new Date()
    ]);

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create session
    await db.query(SQLQueries.CLIENT_PORTAL_SESSIONS.CREATE, [
      user.id,
      sessionToken,
      req.ip,
      req.get('User-Agent'),
      expiresAt
    ]);

    logger.businessEvent('client_portal_user_logged_in', 'client_portal_user', user.id, null);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          clientId: user.client_id
        },
        sessionToken,
        expiresAt
      }
    });
  } catch (error) {
    logger.error('Error logging in client portal user', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_LOGIN_ERROR',
        message: 'Failed to log in'
      }
    });
  }
};

/**
 * Client portal user logout
 * 
 * @route POST /api/v1/client-portal/logout
 * @access Private (Client)
 */
export const logoutClientUser = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken) {
      await db.query(SQLQueries.CLIENT_PORTAL_SESSIONS.DELETE_BY_TOKEN, [sessionToken]);
    }

    logger.info('Client portal user logged out');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Error logging out client portal user', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_LOGOUT_ERROR',
        message: 'Failed to log out'
      }
    });
  }
};

/**
 * Get client cases
 * 
 * @route GET /api/v1/client-portal/cases
 * @access Private (Client)
 */
export const getClientCases = async (req: Request, res: Response) => {
  try {
    const clientId = (req.clientUser as any)?.client_id;

    logger.info('Fetching client cases', { clientId });

    const result = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_BY_CLIENT_ID, [clientId]);
    const cases = result.rows;

    logger.info('Client cases fetched successfully', { clientId, count: cases.length });

    res.json({
      success: true,
      data: { cases }
    });
  } catch (error) {
    logger.error('Error fetching client cases', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_CASES_FETCH_ERROR',
        message: 'Failed to fetch cases'
      }
    });
  }
};

/**
 * Get client case details
 * 
 * @route GET /api/v1/client-portal/cases/:id
 * @access Private (Client)
 */
export const getClientCaseDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = (req.clientUser as any)?.client_id;

    logger.info('Fetching client case details', { clientId, caseId: id });

    const result = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_CASE_DETAILS, [id, clientId]);
    const caseDetails = result.rows[0];

    if (!caseDetails) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: 'Case not found'
        }
      });
    }

    // Get case documents
    const documentsResult = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_CASE_DOCUMENTS, [id]);
    const documents = documentsResult.rows;

    // Get case updates
    const updatesResult = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_CASE_UPDATES, [id]);
    const updates = updatesResult.rows;

    logger.info('Client case details fetched successfully', { clientId, caseId: id });

    res.json({
      success: true,
      data: {
        case: caseDetails,
        documents,
        updates
      }
    });
  } catch (error) {
    logger.error('Error fetching client case details', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_CASE_DETAILS_ERROR',
        message: 'Failed to fetch case details'
      }
    });
  }
};

/**
 * Get client messages
 * 
 * @route GET /api/v1/client-portal/messages
 * @access Private (Client)
 */
export const getClientMessages = async (req: Request, res: Response) => {
  try {
    const clientId = (req.clientUser as any)?.client_id;

    logger.info('Fetching client messages', { clientId });

    const result = await db.query(SQLQueries.CLIENT_PORTAL_MESSAGES.GET_CLIENT_MESSAGES, [clientId]);
    const messages = result.rows;

    logger.info('Client messages fetched successfully', { clientId, count: messages.length });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    logger.error('Error fetching client messages', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_MESSAGES_FETCH_ERROR',
        message: 'Failed to fetch messages'
      }
    });
  }
};

/**
 * Send client message
 * 
 * @route POST /api/v1/client-portal/messages
 * @access Private (Client)
 */
export const sendClientMessage = async (req: Request, res: Response) => {
  try {
    const clientUserId = (req.clientUser as any)?.id;
    const clientId = (req.clientUser as any)?.client_id;
    const {
      subject,
      content,
      caseId
    } = req.body;

    logger.info('Sending client message', { clientUserId, caseId });

    const result = await db.query(SQLQueries.CLIENT_PORTAL_MESSAGES.CREATE, [
      subject,
      content,
      clientUserId,
      'client_message',
      'normal',
      caseId || null,
      clientId
    ]);

    const message = result.rows[0];

    logger.businessEvent('client_message_sent', 'internal_message', message.id, clientUserId);

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    logger.error('Error sending client message', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_MESSAGE_SEND_ERROR',
        message: 'Failed to send message'
      }
    });
  }
};

/**
 * Update client profile
 * 
 * @route PUT /api/v1/client-portal/profile
 * @access Private (Client)
 */
export const updateClientProfile = async (req: Request, res: Response) => {
  try {
    const clientUserId = (req.clientUser as any)?.id;
    const {
      firstName,
      lastName,
      phone
    } = req.body;

    logger.info('Updating client profile', { clientUserId });

    const result = await db.query(SQLQueries.CLIENT_PORTAL_USERS.UPDATE, [
      clientUserId,
      firstName,
      lastName,
      phone
    ]);

    const updatedUser = result.rows[0];

    logger.businessEvent('client_profile_updated', 'client_portal_user', clientUserId, clientUserId);

    res.json({
      success: true,
      data: { 
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          phone: updatedUser.phone
        }
      }
    });
  } catch (error) {
    logger.error('Error updating client profile', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_PROFILE_UPDATE_ERROR',
        message: 'Failed to update profile'
      }
    });
  }
};

export default {
  registerClientUser,
  loginClientUser,
  logoutClientUser,
  getClientCases,
  getClientCaseDetails,
  getClientMessages,
  sendClientMessage,
  updateClientProfile
};