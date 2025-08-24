/**
 * Client Portal Authentication Middleware
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Middleware for client portal authentication and session management
 */

import { Request, Response, NextFunction } from 'express';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Authenticate client portal user
 * Validates client session token and attaches client user to request
 */
export const authenticateClientUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_SESSION_TOKEN',
          message: 'No session token provided'
        }
      });
    }

    // Get session with user details
    const sessionResult = await db.query(`
      SELECT cps.*, cpu.email, cpu.first_name, cpu.last_name, cpu.client_id, c.name as client_name
      FROM client_portal_sessions cps
      JOIN client_portal_users cpu ON cps.client_user_id = cpu.id
      JOIN clients c ON cpu.client_id = c.id
      WHERE cps.session_token = $1 AND cps.expires_at > NOW()
    `, [sessionToken]);

    const session = sessionResult[0];

    if (!session) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Invalid or expired session'
        }
      });
    }

    // Check if client user account is active
    const userResult = await db.query(`
      SELECT * FROM client_portal_users WHERE id = $1 AND status = 'active'
    `, [session.client_user_id]);

    const clientUser = userResult[0];

    if (!clientUser) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INACTIVE_ACCOUNT',
          message: 'Client account is inactive'
        }
      });
    }

    // Attach client user to request
    req.clientUser = {
      id: clientUser.id,
      email: clientUser.email,
      firstName: clientUser.first_name,
      lastName: clientUser.last_name,
      clientId: clientUser.client_id,
      clientName: session.client_name
    };

    // Log access
    logger.info('Client portal user authenticated', {
      clientUserId: clientUser.id,
      clientId: clientUser.client_id,
      ip: req.ip
    });

    return next();
  } catch (error) {
    logger.error('Error authenticating client user', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CLIENT_AUTHENTICATION_ERROR',
        message: 'Authentication failed'
      }
    });
  }
};

/**
 * Optional client authentication
 * Allows routes to work with or without client authentication
 */
export const optionalClientAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken) {
      // Try to authenticate, but don't fail if it doesn't work
      const sessionResult = await db.query(`
        SELECT cps.*, cpu.email, cpu.first_name, cpu.last_name, cpu.client_id, c.name as client_name
        FROM client_portal_sessions cps
        JOIN client_portal_users cpu ON cps.client_user_id = cpu.id
        JOIN clients c ON cpu.client_id = c.id
        WHERE cps.session_token = $1 AND cps.expires_at > NOW()
      `, [sessionToken]);

      const session = sessionResult[0];

      if (session) {
        const userResult = await db.query(`
          SELECT * FROM client_portal_users WHERE id = $1 AND status = 'active'
        `, [session.client_user_id]);

        const clientUser = userResult[0];

        if (clientUser) {
          req.clientUser = {
            id: clientUser.id,
            email: clientUser.email,
            firstName: clientUser.first_name,
            lastName: clientUser.last_name,
            clientId: clientUser.client_id,
            clientName: session.client_name
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail the request, just continue without authentication
    logger.warn('Optional client authentication failed', error as Error);
    return next();
  }
};

/**
 * Rate limiting for client portal
 * Prevents abuse of client portal endpoints
 */
export const clientPortalRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Simple rate limiting - in production, use Redis or similar
  const clientId = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requests per 15 minutes

  // This is a simplified implementation
  // In production, use a proper rate limiting library
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }

  const rateLimit = req.app.locals.rateLimit;
  const clientRequests = rateLimit.get(clientId) || { count: 0, resetTime: now + windowMs };

  if (now > clientRequests.resetTime) {
    clientRequests.count = 1;
    clientRequests.resetTime = now + windowMs;
  } else {
    clientRequests.count++;
  }

  rateLimit.set(clientId, clientRequests);

  if (clientRequests.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    });
  }

  return next();
};

/**
 * Validate client access to specific case
 * Ensures client can only access their own cases
 */
export const validateCaseAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { caseId } = req.params;
    const clientId = (req.clientUser as any)?.clientId;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Check if case belongs to client
    const caseResult = await db.query(`
      SELECT id FROM cases WHERE id = $1 AND client_id = $2
    `, [caseId, clientId]);

    if (!caseResult[0]) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this case'
        }
      });
    }

    return next();
  } catch (error) {
    logger.error('Error validating case access', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CASE_ACCESS_VALIDATION_ERROR',
        message: 'Failed to validate case access'
      }
    });
  }
};

/**
 * Validate client access to specific document
 * Ensures client can only access documents related to their cases
 */
export const validateDocumentAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;
    const clientId = (req.clientUser as any)?.clientId;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Check if document belongs to client's case
    const documentResult = await db.query(`
      SELECT d.id FROM documents d
      JOIN cases c ON d.case_id = c.id
      WHERE d.id = $1 AND c.client_id = $2
    `, [documentId, clientId]);

    if (!documentResult[0]) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this document'
        }
      });
    }

    return next();
  } catch (error) {
    logger.error('Error validating document access', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DOCUMENT_ACCESS_VALIDATION_ERROR',
        message: 'Failed to validate document access'
      }
    });
  }
};

/**
 * Log client portal activity
 * Tracks client portal usage for analytics
 */
export const logClientActivity = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientUserId = (req.clientUser as any)?.id;
      const clientId = (req.clientUser as any)?.clientId;

      if (clientUserId) {
        // Log activity to audit log
        await db.query(`
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          clientUserId,
          action,
          'client_portal',
          clientId,
          JSON.stringify({
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          })
        ]);
      }

      next();
    } catch (error) {
      // Don't fail the request if logging fails
      logger.warn('Failed to log client activity', error as Error);
      next();
    }
  };
};

export default {
  authenticateClientUser,
  optionalClientAuth,
  clientPortalRateLimit,
  validateCaseAccess,
  validateDocumentAccess,
  logClientActivity
};