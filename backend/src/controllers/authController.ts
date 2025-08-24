/**
 * Authentication Controller
 * Handles user authentication, registration, and session management for the RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This controller provides comprehensive authentication functionality including
 * user registration, login, logout, password reset, and social authentication integration.
 * All authentication events are logged for security and compliance purposes.
 * 
 * @example
 * ```typescript
 * import { login, register, logout } from '@/controllers/authController';
 * 
 * // Login route
 * app.post('/api/auth/login', login);
 * 
 * // Register route
 * app.post('/api/auth/register', register);
 * ```
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  hashPassword, 
  comparePassword 
} from '@/middleware/auth';
import { UserRole } from '@/utils/roleAccess';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

// Initialize database service
const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'raghuuco_legal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const db = new DatabaseService(databaseConfig);

/**
 * User registration interface
 */
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
}

/**
 * User login interface
 */
interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Password reset request interface
 */
interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation interface
 */
interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

/**
 * Register a new user account
 * 
 * @route POST /api/v1/auth/register
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Request body
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "role": "junior_associate",
 *   "phone": "+91-9876543210"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "role": "junior_associate"
 *     },
 *     "tokens": {
 *       "accessToken": "jwt_token",
 *       "refreshToken": "refresh_token"
 *     }
 *   }
 * }
 * ```
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, role = UserRole.JUNIOR_ASSOCIATE, phone }: RegisterRequest = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, first name, and last name are required'
        }
      });
      return;
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData = {
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role,
      phone,
      isActive: true,
      emailVerified: false
    };

    const user = await db.createUser(userData);

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    // Log successful registration
    logger.authEvent('user_registered', user.id, true, req.ip);

    // Create audit log
    await db.createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      resourceType: 'users',
      resourceId: user.id,
      newValues: { email, firstName, lastName, role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('User registration failed', error as Error, { email: req.body.email });
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Failed to register user'
      }
    });
  }
}

/**
 * Authenticate user and generate access tokens
 * 
 * @route POST /api/v1/auth/login
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Request body
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "role": "junior_associate"
 *     },
 *     "tokens": {
 *       "accessToken": "jwt_token",
 *       "refreshToken": "refresh_token"
 *     }
 *   }
 * }
 * ```
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
      return;
    }

    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      logger.authEvent('login_failed', undefined, false, req.ip, { email });
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      logger.authEvent('login_failed', user.id, false, req.ip, { reason: 'inactive_user' });
      res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Account is disabled'
        }
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      logger.authEvent('login_failed', user.id, false, req.ip, { reason: 'invalid_password' });
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
      return;
    }

    // Update last login
    await db.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    // Log successful login
    logger.authEvent('login_success', user.id, true, req.ip);

    // Create audit log
    await db.createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      resourceType: 'users',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('User login failed', error as Error, { email: req.body.email });
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to authenticate user'
      }
    });
  }
}

/**
 * Refresh access token using refresh token
 * 
 * @route POST /api/v1/auth/refresh
 * @param req - Express request object containing refresh token
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Request body
 * {
 *   "refreshToken": "refresh_token_here"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "accessToken": "new_jwt_token",
 *     "refreshToken": "new_refresh_token"
 *   }
 * }
 * ```
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Refresh token is required'
        }
      });
      return;
    }

    // Verify refresh token
    const decoded = await db.queryOne(
      'SELECT * FROM user_sessions WHERE refresh_token = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP',
      [refreshToken]
    );

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
      return;
    }

    // Get user information
    const user = await db.getUserById(decoded.user_id);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive'
        }
      });
      return;
    }

    // Generate new tokens
    const newAccessToken = await generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = await generateRefreshToken(user.id);

    // Update session with new refresh token
    await db.query(
      'UPDATE user_sessions SET refresh_token = $1, expires_at = $2 WHERE refresh_token = $3',
      [newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), refreshToken]
    );

    logger.authEvent('token_refreshed', user.id, true, req.ip);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_FAILED',
        message: 'Failed to refresh token'
      }
    });
  }
}

/**
 * Logout user and invalidate session
 * 
 * @route POST /api/v1/auth/logout
 * @param req - Authenticated request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Request body
 * {
 *   "refreshToken": "refresh_token_here"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Successfully logged out"
 * }
 * ```
 */
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Refresh token is required'
        }
      });
      return;
    }

    // Invalidate refresh token
    await db.query(
      'UPDATE user_sessions SET is_active = false WHERE refresh_token = $1',
      [refreshToken]
    );

    if (userId) {
      logger.authEvent('logout_success', userId, true, req.ip);

      // Create audit log
      await db.createAuditLog({
        userId,
        action: 'USER_LOGOUT',
        resourceType: 'users',
        resourceId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    logger.error('Logout failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_FAILED',
        message: 'Failed to logout'
      }
    });
  }
}

/**
 * Get current user profile
 * 
 * @route GET /api/v1/auth/profile
 * @param req - Authenticated request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "role": "junior_associate",
 *       "phone": "+91-9876543210",
 *       "lastLogin": "2025-08-24T10:30:00Z"
 *     }
 *   }
 * }
 * ```
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const user = await db.getUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          lastLogin: user.last_login
        }
      }
    });
  } catch (error) {
    logger.error('Get profile failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Failed to fetch user profile'
      }
    });
  }
}

/**
 * Update user profile
 * 
 * @route PUT /api/v1/auth/profile
 * @param req - Authenticated request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Request body
 * {
 *   "firstName": "John",
 *   "lastName": "Smith",
 *   "phone": "+91-9876543210"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Smith",
 *       "role": "junior_associate",
 *       "phone": "+91-9876543210"
 *     }
 *   }
 * }
 * ```
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, phone } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    // Update user profile
    const updatedUser = await db.updateUser(userId, {
      firstName,
      lastName,
      phone
    });

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
      return;
    }

    // Create audit log
    await db.createAuditLog({
      userId,
      action: 'PROFILE_UPDATED',
      resourceType: 'users',
      resourceId: userId,
      newValues: { firstName, lastName, phone },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          phone: updatedUser.phone
        }
      }
    });
  } catch (error) {
    logger.error('Update profile failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Failed to update user profile'
      }
    });
  }
}

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
};