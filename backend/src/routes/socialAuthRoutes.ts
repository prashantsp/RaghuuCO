/**
 * Social Authentication Routes
 * OAuth 2.0 authentication routes for Google, LinkedIn, and Microsoft 365
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This module defines all social authentication-related API routes including
 * OAuth 2.0 authentication flows for Google, LinkedIn, and Microsoft 365. It handles
 * authentication initiation, callbacks, and account linking/unlinking.
 * 
 * @example
 * ```typescript
 * import socialAuthRoutes from '@/routes/socialAuthRoutes';
 * 
 * // Mount social authentication routes
 * app.use('/api/v1/auth', socialAuthRoutes);
 * ```
 */

import { Router } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
import passport from 'passport';
import { 
  googleAuth, 
  linkedinAuth, 
  microsoftAuth, 
  linkSocialAccount, 
  unlinkSocialAccount 
} from '@/controllers/socialAuthController';
import { authenticateToken } from '@/middleware/auth';
import logger from '@/utils/logger';

/**
 * Social authentication router instance
 */
const router = Router();

/**
 * Google OAuth 2.0 authentication initiation
 * 
 * @route GET /api/v1/auth/google
 * @description Initiates Google OAuth 2.0 authentication flow
 * @access Public
 * 
 * @returns {Object} 302 - Redirects to Google OAuth consent screen
 * @returns {Object} 500 - Server error
 */
router.get('/google', (req, res, next) => {
  logger.info('Google OAuth initiation', { ip: req.ip });
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

/**
 * Google OAuth 2.0 authentication callback
 * 
 * @route GET /api/v1/auth/google/callback
 * @description Handles Google OAuth 2.0 callback and user authentication
 * @access Public
 * 
 * @returns {Object} 302 - Redirects to frontend with tokens
 * @returns {Object} 401 - Authentication failed
 * @returns {Object} 500 - Server error
 */
router.get('/google/callback', async (req, res, next) => {
  try {
    logger.info('Google OAuth callback received', { ip: req.ip });
    await googleAuth(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * LinkedIn OAuth 2.0 authentication initiation
 * 
 * @route GET /api/v1/auth/linkedin
 * @description Initiates LinkedIn OAuth 2.0 authentication flow
 * @access Public
 * 
 * @returns {Object} 302 - Redirects to LinkedIn OAuth consent screen
 * @returns {Object} 500 - Server error
 */
router.get('/linkedin', (req, res, next) => {
  logger.info('LinkedIn OAuth initiation', { ip: req.ip });
  passport.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile']
  })(req, res, next);
});

/**
 * LinkedIn OAuth 2.0 authentication callback
 * 
 * @route GET /api/v1/auth/linkedin/callback
 * @description Handles LinkedIn OAuth 2.0 callback and user authentication
 * @access Public
 * 
 * @returns {Object} 302 - Redirects to frontend with tokens
 * @returns {Object} 401 - Authentication failed
 * @returns {Object} 500 - Server error
 */
router.get('/linkedin/callback', async (req, res, next) => {
  try {
    logger.info('LinkedIn OAuth callback received', { ip: req.ip });
    await linkedinAuth(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Microsoft 365 OAuth 2.0 authentication initiation
 * 
 * @route GET /api/v1/auth/microsoft
 * @description Initiates Microsoft 365 OAuth 2.0 authentication flow
 * @access Public
 * 
 * @returns {Object} 302 - Redirects to Microsoft OAuth consent screen
 * @returns {Object} 500 - Server error
 */
router.get('/microsoft', (req, res, next) => {
  logger.info('Microsoft OAuth initiation', { ip: req.ip });
  passport.authenticate('microsoft', {
    scope: ['user.read', 'email']
  })(req, res, next);
});

/**
 * Microsoft 365 OAuth 2.0 authentication callback
 * 
 * @route GET /api/v1/auth/microsoft/callback
 * @description Handles Microsoft 365 OAuth 2.0 callback and user authentication
 * @access Public
 * 
 * @returns {Object} 302 - Redirects to frontend with tokens
 * @returns {Object} 401 - Authentication failed
 * @returns {Object} 500 - Server error
 */
router.get('/microsoft/callback', async (req, res, next) => {
  try {
    logger.info('Microsoft OAuth callback received', { ip: req.ip });
    await microsoftAuth(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Link social account to existing user
 * 
 * @route POST /api/v1/auth/link-social
 * @description Links a social account to an existing user account
 * @access Private (requires authentication)
 * 
 * @body {string} provider - Social provider (google, linkedin, microsoft)
 * @body {string} accessToken - OAuth access token
 * @body {string} refreshToken - OAuth refresh token
 * 
 * @returns {Object} 200 - Social account linked successfully
 * @returns {Object} 400 - Invalid social token
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 409 - Social account already linked
 * @returns {Object} 500 - Server error
 */
router.post('/link-social', authenticateToken, async (req, res, next) => {
  try {
    logger.info('Social account linking attempt', { 
      userId: (req as AuthenticatedRequest).user?.id, 
      provider: req.body.provider, 
      ip: req.ip 
    });
    await linkSocialAccount(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * Unlink social account from user
 * 
 * @route DELETE /api/v1/auth/unlink-social/:provider
 * @description Unlinks a social account from a user account
 * @access Private (requires authentication)
 * 
 * @param {string} provider - Social provider (google, linkedin, microsoft)
 * 
 * @returns {Object} 200 - Social account unlinked successfully
 * @returns {Object} 400 - Cannot unlink last authentication method
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 500 - Server error
 */
router.delete('/unlink-social/:provider', authenticateToken, async (req, res, next) => {
  try {
    logger.info('Social account unlinking attempt', { 
      userId: (req as AuthenticatedRequest).user?.id, 
      provider: req.params.provider, 
      ip: req.ip 
    });
    await unlinkSocialAccount(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;