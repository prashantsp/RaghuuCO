/**
 * Authentication Routes
 * API routes for user authentication and session management
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This module defines all authentication-related API routes including
 * user registration, login, logout, token refresh, and profile management.
 * All routes include proper validation, error handling, and security measures.
 * 
 * @example
 * ```typescript
 * import authRoutes from '@/routes/authRoutes';
 * 
 * // Mount authentication routes
 * app.use('/api/v1/auth', authRoutes);
 * ```
 */

import { Router } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile 
} from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/utils/logger';

/**
 * Authentication router instance
 */
const router = Router();

/**
 * User registration endpoint
 * 
 * @route POST /api/v1/auth/register
 * @description Register a new user account with email and password
 * @access Public
 * 
 * @body {string} email - User's email address
 * @body {string} password - User's password (min 8 characters)
 * @body {string} firstName - User's first name
 * @body {string} lastName - User's last name
 * @body {string} [role] - User's role (default: junior_associate)
 * @body {string} [phone] - User's phone number
 * 
 * @returns {Object} 201 - User created successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 409 - User already exists
 * @returns {Object} 500 - Server error
 */
router.post('/register', async (req, res, next) => {
  try {
    logger.info('User registration attempt', { email: req.body.email, ip: req.ip });
    await register(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * User login endpoint
 * 
 * @route POST /api/v1/auth/login
 * @description Authenticate user with email and password
 * @access Public
 * 
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * 
 * @returns {Object} 200 - Login successful
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Invalid credentials
 * @returns {Object} 500 - Server error
 */
router.post('/login', async (req, res, next) => {
  try {
    logger.info('User login attempt', { email: req.body.email, ip: req.ip });
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Token refresh endpoint
 * 
 * @route POST /api/v1/auth/refresh
 * @description Refresh access token using refresh token
 * @access Public
 * 
 * @body {string} refreshToken - Valid refresh token
 * 
 * @returns {Object} 200 - Token refreshed successfully
 * @returns {Object} 400 - Missing refresh token
 * @returns {Object} 401 - Invalid refresh token
 * @returns {Object} 500 - Server error
 */
router.post('/refresh', async (req, res, next) => {
  try {
    logger.info('Token refresh attempt', { ip: req.ip });
    await refreshToken(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * User logout endpoint
 * 
 * @route POST /api/v1/auth/logout
 * @description Logout user and invalidate session
 * @access Private (requires authentication)
 * 
 * @body {string} refreshToken - Refresh token to invalidate
 * 
 * @returns {Object} 200 - Logout successful
 * @returns {Object} 400 - Missing refresh token
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 500 - Server error
 */
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    logger.info('User logout attempt', { userId: (req as AuthenticatedRequest).user?.id, ip: req.ip });
    await logout(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Get user profile endpoint
 * 
 * @route GET /api/v1/auth/profile
 * @description Get current user's profile information
 * @access Private (requires authentication)
 * 
 * @returns {Object} 200 - Profile retrieved successfully
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Server error
 */
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    logger.info('Profile fetch attempt', { userId: (req as AuthenticatedRequest).user?.id, ip: req.ip });
    await getProfile(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Update user profile endpoint
 * 
 * @route PUT /api/v1/auth/profile
 * @description Update current user's profile information
 * @access Private (requires authentication)
 * 
 * @body {string} [firstName] - User's first name
 * @body {string} [lastName] - User's last name
 * @body {string} [phone] - User's phone number
 * 
 * @returns {Object} 200 - Profile updated successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Server error
 */
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    logger.info('Profile update attempt', { userId: (req as AuthenticatedRequest).user?.id, ip: req.ip });
    await updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;