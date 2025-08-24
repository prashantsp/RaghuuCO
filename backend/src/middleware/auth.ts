/**
 * Authentication Middleware
 * JWT-based authentication and authorization middleware for the RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This module provides comprehensive authentication and authorization middleware
 * for the legal practice management system. It includes JWT token validation, role-based
 * access control, and session management functionality.
 * 
 * @example
 * ```typescript
 * import { authenticateToken, authorizeRole } from '@/middleware/auth';
 * 
 * // Protect a route with authentication
 * app.get('/api/cases', authenticateToken, casesController.getCases);
 * 
 * // Protect a route with role-based authorization
 * app.post('/api/cases', authenticateToken, authorizeRole(['partner', 'senior_associate']), casesController.createCase);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole, Permission, hasPermission } from '@/utils/roleAccess';
import logger from '@/utils/logger';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
    iat: number;
    exp: number;
  };
}

/**
 * JWT token payload interface
 */
interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

/**
 * JWT secret key from environment variables
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * JWT token expiration time in seconds
 * @default 3600 (1 hour)
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600';

/**
 * Refresh token expiration time in seconds
 * @default 604800 (7 days)
 */
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '604800';

/**
 * Generates a JWT access token for a user
 * 
 * @param userId - User's unique identifier
 * @param email - User's email address
 * @param role - User's role in the system
 * @returns Promise<string> - JWT access token
 * 
 * @example
 * ```typescript
 * const token = await generateAccessToken('user-123', 'user@example.com', UserRole.PARTNER);
 * ```
 */
export async function generateAccessToken(
  userId: string, 
  email: string, 
  role: UserRole
): Promise<string> {
  try {
    const payload: JWTPayload = {
      id: userId,
      email,
      role,
      permissions: [], // Will be populated from roleAccess
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(JWT_EXPIRES_IN)
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    (logger as any).authEvent('token_generated', userId, true);
    return token;
  } catch (error) {
    logger.error('Failed to generate access token', error as Error, { userId, email, role });
    throw new Error('Token generation failed');
  }
}

/**
 * Generates a JWT refresh token for a user
 * 
 * @param userId - User's unique identifier
 * @returns Promise<string> - JWT refresh token
 * 
 * @example
 * ```typescript
 * const refreshToken = await generateRefreshToken('user-123');
 * ```
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  try {
    const payload = {
      id: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + parseInt(REFRESH_TOKEN_EXPIRES_IN)
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    
    (logger as any).authEvent('refresh_token_generated', userId, true);
    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', error as Error, { userId });
    throw new Error('Refresh token generation failed');
  }
}

/**
 * Verifies and decodes a JWT token
 * 
 * @param token - JWT token to verify
 * @returns Promise<JWTPayload> - Decoded token payload
 * 
 * @example
 * ```typescript
 * const payload = await verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * ```
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error('Token verification failed', error as Error);
    throw new Error('Invalid token');
  }
}

/**
 * Middleware to authenticate JWT tokens
 * Validates the Authorization header and attaches user information to the request
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @example
 * ```typescript
 * app.get('/api/protected', authenticateToken, (req, res) => {
 *   // req.user is now available with user information
 *   res.json({ user: req.user });
 * });
 * ```
 */
export function authenticateToken(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.securityEvent('authentication_failed', undefined, req.ip, { reason: 'no_token' });
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_MISSING',
        message: 'Access token required'
      }
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      logger.securityEvent('authentication_failed', undefined, req.ip, { 
        reason: 'invalid_token',
        error: err.message 
      });
      res.status(403).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid or expired token'
        }
      });
      return;
    }

    (req as AuthenticatedRequest).user = decoded;
    logger.authEvent('token_validated', decoded.id as string, true, req.ip);
    next();
  });
}

/**
 * Middleware to authorize specific roles
 * Checks if the authenticated user has one of the required roles
 * 
 * @param roles - Array of allowed user roles
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * app.post('/api/cases', 
 *   authenticateToken, 
 *   authorizeRole([UserRole.PARTNER, UserRole.SENIOR_ASSOCIATE]), 
 *   casesController.createCase
 * );
 * ```
 */
export function authorizeRole(roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.securityEvent('authorization_failed', req.user.id, req.ip, {
        requiredRoles: roles,
        userRole: req.user.role
      });
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Access denied - insufficient permissions'
        }
      });
      return;
    }

    logger.authEvent('authorization_success', req.user.id as string, true, req.ip);
    next();
  };
}

/**
 * Middleware to authorize specific permissions
 * Checks if the authenticated user has the required permission
 * 
 * @param permission - Required permission
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * app.delete('/api/cases/:id', 
 *   authenticateToken, 
 *   authorizePermission(Permission.CASE_DELETE), 
 *   casesController.deleteCase
 * );
 * ```
 */
export function authorizePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      logger.securityEvent('permission_denied', req.user.id, req.ip, {
        requiredPermission: permission,
        userRole: req.user.role
      });
      res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Access denied - permission required'
        }
      });
      return;
    }

    logger.authEvent('permission_granted', req.user.id as string, true, req.ip);
    next();
  };
}

/**
 * Middleware to authorize multiple permissions (any of them)
 * Checks if the authenticated user has at least one of the required permissions
 * 
 * @param permissions - Array of required permissions
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * app.get('/api/reports', 
 *   authenticateToken, 
 *   authorizeAnyPermission([Permission.REPORT_READ, Permission.REPORT_CREATE]), 
 *   reportsController.getReports
 * );
 * ```
 */
export function authorizeAnyPermission(permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const hasAnyPermission = permissions.some(permission => 
      hasPermission(req.user!.role, permission)
    );

    if (!hasAnyPermission) {
      logger.securityEvent('permission_denied', req.user.id, req.ip, {
        requiredPermissions: permissions,
        userRole: req.user.role
      });
      res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Access denied - insufficient permissions'
        }
      });
      return;
    }

    logger.authEvent('permission_granted', req.user.id as string, true, req.ip);
    next();
  };
}

/**
 * Middleware to authorize multiple permissions (all of them)
 * Checks if the authenticated user has all of the required permissions
 * 
 * @param permissions - Array of required permissions
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * app.post('/api/admin/users', 
 *   authenticateToken, 
 *   authorizeAllPermissions([Permission.USER_CREATE, Permission.USER_MANAGE_ROLES]), 
 *   adminController.createUser
 * );
 * ```
 */
export function authorizeAllPermissions(permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const hasAllPermissions = permissions.every(permission => 
      hasPermission(req.user!.role, permission)
    );

    if (!hasAllPermissions) {
      logger.securityEvent('permission_denied', req.user.id, req.ip, {
        requiredPermissions: permissions,
        userRole: req.user.role
      });
      res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Access denied - insufficient permissions'
        }
      });
      return;
    }

    logger.authEvent('permission_granted', req.user.id as string, true, req.ip);
    next();
  };
}

/**
 * Utility function to hash passwords using bcrypt
 * 
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise<string> - Hashed password
 * 
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('mySecurePassword');
 * ```
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    logger.error('Password hashing failed', error as Error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Utility function to compare passwords using bcrypt
 * 
 * @param password - Plain text password to check
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise<boolean> - True if passwords match
 * 
 * @example
 * ```typescript
 * const isValid = await comparePassword('myPassword', hashedPassword);
 * ```
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    logger.error('Password comparison failed', error as Error);
    return false;
  }
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authenticateToken,
  authorizeRole,
  authorizePermission,
  authorizeAnyPermission,
  authorizeAllPermissions,
  hashPassword,
  comparePassword
};