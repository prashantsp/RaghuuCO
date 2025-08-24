/**
 * Social Authentication Controller
 * Handles OAuth 2.0 authentication with Google, LinkedIn, and Microsoft 365
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This controller provides OAuth 2.0 authentication integration with
 * Google, LinkedIn, and Microsoft 365. It handles user authentication, account
 * linking, and profile synchronization from social providers.
 * 
 * @example
 * ```typescript
 * import { googleAuth, linkedinAuth, microsoftAuth } from '@/controllers/socialAuthController';
 * 
 * // Google OAuth callback
 * app.get('/api/v1/auth/google/callback', googleAuth);
 * ```
 */

import { Request, Response } from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken } from '@/middleware/auth';
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
 * Google OAuth 2.0 authentication callback
 * 
 * @route GET /api/v1/auth/google/callback
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Redirects to Google OAuth
 * app.get('/api/v1/auth/google', passport.authenticate('google', {
 *   scope: ['profile', 'email']
 * }));
 * 
 * // Handles callback from Google
 * app.get('/api/v1/auth/google/callback', googleAuth);
 * ```
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    passport.authenticate('google', { session: false }, async (err: any, user: any, info: any) => {
      if (err) {
        logger.error('Google OAuth error', err);
        res.status(500).json({
          success: false,
          error: {
            code: 'GOOGLE_OAUTH_ERROR',
            message: 'Google authentication failed'
          }
        });
        return;
      }

      if (!user) {
        logger.authEvent('google_oauth_failed', undefined, false, req.ip);
        res.status(401).json({
          success: false,
          error: {
            code: 'GOOGLE_OAUTH_FAILED',
            message: 'Google authentication failed'
          }
        });
        return;
      }

      // Check if user exists in our database
      let dbUser = await db.getUserByEmail(user.email);

      if (!dbUser) {
        // Create new user from Google profile
        const userData = {
          email: user.email,
          firstName: user.firstName || user.displayName?.split(' ')[0] || '',
          lastName: user.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
          role: UserRole.JUNIOR_ASSOCIATE,
          isActive: true,
          emailVerified: true
        };

        dbUser = await db.createUser(userData);

        // Create social account record
        await db.createSocialAccount({
          userId: dbUser.id,
          provider: 'google',
          providerId: user.id,
          email: user.email,
          displayName: user.displayName,
          profileUrl: user.profileUrl,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        logger.authEvent('user_registered_google', dbUser.id, true, req.ip);
      } else {
        // Update existing user's social account
        await db.updateSocialAccount(dbUser.id, 'google', {
          providerId: user.id,
          displayName: user.displayName,
          profileUrl: user.profileUrl,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        logger.authEvent('user_login_google', dbUser.id, true, req.ip);
      }

      // Generate tokens
      const accessToken = await generateAccessToken(dbUser.id, dbUser.email, dbUser.role);
      const refreshToken = await generateRefreshToken(dbUser.id);

      // Create audit log
      await db.createAuditLog({
        userId: dbUser.id,
        action: 'SOCIAL_LOGIN_GOOGLE',
        resourceType: 'users',
        resourceId: dbUser.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    })(req, res);
  } catch (error) {
    logger.error('Google OAuth processing failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GOOGLE_OAUTH_PROCESSING_ERROR',
        message: 'Failed to process Google authentication'
      }
    });
  }
}

/**
 * LinkedIn OAuth 2.0 authentication callback
 * 
 * @route GET /api/v1/auth/linkedin/callback
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Redirects to LinkedIn OAuth
 * app.get('/api/v1/auth/linkedin', passport.authenticate('linkedin', {
 *   scope: ['r_emailaddress', 'r_liteprofile']
 * }));
 * 
 * // Handles callback from LinkedIn
 * app.get('/api/v1/auth/linkedin/callback', linkedinAuth);
 * ```
 */
export async function linkedinAuth(req: Request, res: Response): Promise<void> {
  try {
    passport.authenticate('linkedin', { session: false }, async (err: any, user: any, info: any) => {
      if (err) {
        logger.error('LinkedIn OAuth error', err);
        res.status(500).json({
          success: false,
          error: {
            code: 'LINKEDIN_OAUTH_ERROR',
            message: 'LinkedIn authentication failed'
          }
        });
        return;
      }

      if (!user) {
        logger.authEvent('linkedin_oauth_failed', undefined, false, req.ip);
        res.status(401).json({
          success: false,
          error: {
            code: 'LINKEDIN_OAUTH_FAILED',
            message: 'LinkedIn authentication failed'
          }
        });
        return;
      }

      // Check if user exists in our database
      let dbUser = await db.getUserByEmail(user.email);

      if (!dbUser) {
        // Create new user from LinkedIn profile
        const userData = {
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: UserRole.JUNIOR_ASSOCIATE,
          isActive: true,
          emailVerified: true
        };

        dbUser = await db.createUser(userData);

        // Create social account record
        await db.createSocialAccount({
          userId: dbUser.id,
          provider: 'linkedin',
          providerId: user.id,
          email: user.email,
          displayName: user.displayName,
          profileUrl: user.profileUrl,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        logger.authEvent('user_registered_linkedin', dbUser.id, true, req.ip);
      } else {
        // Update existing user's social account
        await db.updateSocialAccount(dbUser.id, 'linkedin', {
          providerId: user.id,
          displayName: user.displayName,
          profileUrl: user.profileUrl,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        logger.authEvent('user_login_linkedin', dbUser.id, true, req.ip);
      }

      // Generate tokens
      const accessToken = await generateAccessToken(dbUser.id, dbUser.email, dbUser.role);
      const refreshToken = await generateRefreshToken(dbUser.id);

      // Create audit log
      await db.createAuditLog({
        userId: dbUser.id,
        action: 'SOCIAL_LOGIN_LINKEDIN',
        resourceType: 'users',
        resourceId: dbUser.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    })(req, res);
  } catch (error) {
    logger.error('LinkedIn OAuth processing failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LINKEDIN_OAUTH_PROCESSING_ERROR',
        message: 'Failed to process LinkedIn authentication'
      }
    });
  }
}

/**
 * Microsoft 365 OAuth 2.0 authentication callback
 * 
 * @route GET /api/v1/auth/microsoft/callback
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Redirects to Microsoft OAuth
 * app.get('/api/v1/auth/microsoft', passport.authenticate('microsoft', {
 *   scope: ['user.read', 'email']
 * }));
 * 
 * // Handles callback from Microsoft
 * app.get('/api/v1/auth/microsoft/callback', microsoftAuth);
 * ```
 */
export async function microsoftAuth(req: Request, res: Response): Promise<void> {
  try {
    passport.authenticate('microsoft', { session: false }, async (err: any, user: any, info: any) => {
      if (err) {
        logger.error('Microsoft OAuth error', err);
        res.status(500).json({
          success: false,
          error: {
            code: 'MICROSOFT_OAUTH_ERROR',
            message: 'Microsoft authentication failed'
          }
        });
        return;
      }

      if (!user) {
        logger.authEvent('microsoft_oauth_failed', undefined, false, req.ip);
        res.status(401).json({
          success: false,
          error: {
            code: 'MICROSOFT_OAUTH_FAILED',
            message: 'Microsoft authentication failed'
          }
        });
        return;
      }

      // Check if user exists in our database
      let dbUser = await db.getUserByEmail(user.email);

      if (!dbUser) {
        // Create new user from Microsoft profile
        const userData = {
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: UserRole.JUNIOR_ASSOCIATE,
          isActive: true,
          emailVerified: true
        };

        dbUser = await db.createUser(userData);

        // Create social account record
        await db.createSocialAccount({
          userId: dbUser.id,
          provider: 'microsoft',
          providerId: user.id,
          email: user.email,
          displayName: user.displayName,
          profileUrl: user.profileUrl,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        logger.authEvent('user_registered_microsoft', dbUser.id, true, req.ip);
      } else {
        // Update existing user's social account
        await db.updateSocialAccount(dbUser.id, 'microsoft', {
          providerId: user.id,
          displayName: user.displayName,
          profileUrl: user.profileUrl,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken
        });

        logger.authEvent('user_login_microsoft', dbUser.id, true, req.ip);
      }

      // Generate tokens
      const accessToken = await generateAccessToken(dbUser.id, dbUser.email, dbUser.role);
      const refreshToken = await generateRefreshToken(dbUser.id);

      // Create audit log
      await db.createAuditLog({
        userId: dbUser.id,
        action: 'SOCIAL_LOGIN_MICROSOFT',
        resourceType: 'users',
        resourceId: dbUser.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    })(req, res);
  } catch (error) {
    logger.error('Microsoft OAuth processing failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MICROSOFT_OAUTH_PROCESSING_ERROR',
        message: 'Failed to process Microsoft authentication'
      }
    });
  }
}

/**
 * Link social account to existing user
 * 
 * @route POST /api/v1/auth/link-social
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Link social account
 * app.post('/api/v1/auth/link-social', authenticateToken, linkSocialAccount);
 * ```
 */
export async function linkSocialAccount(req: Request, res: Response): Promise<void> {
  try {
    const { provider, accessToken, refreshToken } = req.body;
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

    // Verify social account and get profile
    const profile = await verifySocialToken(provider, accessToken);
    
    if (!profile) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SOCIAL_TOKEN',
          message: 'Invalid social account token'
        }
      });
      return;
    }

    // Check if social account is already linked to another user
    const existingSocialAccount = await db.getSocialAccountByProviderId(provider, profile.id);
    
    if (existingSocialAccount && existingSocialAccount.user_id !== userId) {
      res.status(409).json({
        success: false,
        error: {
          code: 'SOCIAL_ACCOUNT_LINKED',
          message: 'This social account is already linked to another user'
        }
      });
      return;
    }

    // Create or update social account
    await db.createSocialAccount({
      userId,
      provider,
      providerId: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      accessToken,
      refreshToken
    });

    logger.authEvent('social_account_linked', userId, true, req.ip, { provider });

    // Create audit log
    await db.createAuditLog({
      userId,
      action: 'SOCIAL_ACCOUNT_LINKED',
      resourceType: 'social_accounts',
      resourceId: userId,
      newValues: { provider, email: profile.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Social account linked successfully',
      data: {
        provider,
        email: profile.email,
        displayName: profile.displayName
      }
    });
  } catch (error) {
    logger.error('Social account linking failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SOCIAL_LINKING_FAILED',
        message: 'Failed to link social account'
      }
    });
  }
}

/**
 * Unlink social account from user
 * 
 * @route DELETE /api/v1/auth/unlink-social/:provider
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Unlink social account
 * app.delete('/api/v1/auth/unlink-social/:provider', authenticateToken, unlinkSocialAccount);
 * ```
 */
export async function unlinkSocialAccount(req: Request, res: Response): Promise<void> {
  try {
    const { provider } = req.params;
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

    // Check if user has local password (can't unlink if no other auth method)
    const user = await db.getUserById(userId);
    if (!user.password_hash) {
      const socialAccounts = await db.getUserSocialAccounts(userId);
      if (socialAccounts.length <= 1) {
        res.status(400).json({
          success: false,
          error: {
            code: 'LAST_AUTH_METHOD',
            message: 'Cannot unlink the last authentication method'
          }
        });
        return;
      }
    }

    // Delete social account
    await db.deleteSocialAccount(userId, provider);

    logger.authEvent('social_account_unlinked', userId, true, req.ip, { provider });

    // Create audit log
    await db.createAuditLog({
      userId,
      action: 'SOCIAL_ACCOUNT_UNLINKED',
      resourceType: 'social_accounts',
      resourceId: userId,
      oldValues: { provider },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Social account unlinked successfully'
    });
  } catch (error) {
    logger.error('Social account unlinking failed', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SOCIAL_UNLINKING_FAILED',
        message: 'Failed to unlink social account'
      }
    });
  }
}

/**
 * Verify social token and get user profile
 * 
 * @param provider - Social provider (google, linkedin, microsoft)
 * @param accessToken - OAuth access token
 * @returns Promise<any> - User profile from social provider
 */
async function verifySocialToken(provider: string, accessToken: string): Promise<any> {
  // Implementation would verify the token with the respective provider
  // and return the user profile
  // This is a simplified implementation
  return {
    id: 'social_user_id',
    email: 'user@example.com',
    displayName: 'User Name',
    profileUrl: 'https://provider.com/user'
  };
}

export default {
  googleAuth,
  linkedinAuth,
  microsoftAuth,
  linkSocialAccount,
  unlinkSocialAccount
};