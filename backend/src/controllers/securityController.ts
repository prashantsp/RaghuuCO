/**
 * Security Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for security management including 2FA setup and security settings
 */

import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Setup 2FA for user
 * 
 * @route POST /api/v1/security/2fa/setup
 * @access Private
 */
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    logger.info('Setting up 2FA for user', { userId });

    // Generate new secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userId, 'RAGHUU CO', secret);

    // Store secret temporarily (user needs to verify before saving permanently)
    const tempSecret = crypto.randomBytes(32).toString('hex');
    
    // Store in session or temporary storage
    req.session.temp2FASecret = secret;

    logger.info('2FA setup initiated', { userId });

    res.json({
      success: true,
      data: {
        secret,
        otpauth,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`
      }
    });
  } catch (error) {
    logger.error('Error setting up 2FA', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: '2FA_SETUP_ERROR',
        message: 'Failed to setup two-factor authentication'
      }
    });
  }
};

/**
 * Verify and enable 2FA
 * 
 * @route POST /api/v1/security/2fa/verify
 * @access Private
 */
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { totpToken } = req.body;

    if (!totpToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOTP_TOKEN_REQUIRED',
          message: 'TOTP token is required'
        }
      });
    }

    const tempSecret = req.session.temp2FASecret;
    if (!tempSecret) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TEMP_SECRET',
          message: 'No temporary 2FA secret found. Please setup 2FA first.'
        }
      });
    }

    // Verify TOTP token
    const isValid = authenticator.verify({
      token: totpToken,
      secret: tempSecret
    });

    if (!isValid) {
      logger.warn('Invalid TOTP token during 2FA verification', { userId });
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOTP_TOKEN',
          message: 'Invalid TOTP token'
        }
      });
    }

    // Save 2FA secret to database using centralized query
    await db.query(SQLQueries.SECURITY.UPDATE_2FA_SECRET, [tempSecret, userId]);

    // Clear temporary secret
    delete req.session.temp2FASecret;

    logger.businessEvent('2fa_enabled', 'user', userId, userId);

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    logger.error('Error verifying 2FA', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: '2FA_VERIFICATION_ERROR',
        message: 'Failed to verify two-factor authentication'
      }
    });
  }
};

/**
 * Disable 2FA
 * 
 * @route POST /api/v1/security/2fa/disable
 * @access Private
 */
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { totpToken } = req.body;

    if (!totpToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOTP_TOKEN_REQUIRED',
          message: 'TOTP token is required to disable 2FA'
        }
      });
    }

    // Get current 2FA secret using centralized query
    const userResult = await db.query(SQLQueries.SECURITY.GET_2FA_SECRET, [userId]);
    const user = userResult.rows[0];

    if (!user?.two_factor_secret) {
      return res.status(400).json({
        success: false,
        error: {
          code: '2FA_NOT_ENABLED',
          message: 'Two-factor authentication is not enabled'
        }
      });
    }

    // Verify TOTP token
    const isValid = authenticator.verify({
      token: totpToken,
      secret: user.two_factor_secret
    });

    if (!isValid) {
      logger.warn('Invalid TOTP token during 2FA disable', { userId });
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOTP_TOKEN',
          message: 'Invalid TOTP token'
        }
      });
    }

    // Disable 2FA using centralized query
    await db.query(SQLQueries.SECURITY.DISABLE_2FA, [userId]);

    logger.businessEvent('2fa_disabled', 'user', userId, userId);

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    logger.error('Error disabling 2FA', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: '2FA_DISABLE_ERROR',
        message: 'Failed to disable two-factor authentication'
      }
    });
  }
};

/**
 * Get 2FA status
 * 
 * @route GET /api/v1/security/2fa/status
 * @access Private
 */
export const get2FAStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    const userResult = await db.query(SQLQueries.SECURITY.GET_2FA_STATUS, [userId]);
    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        enabled: user?.two_factor_enabled || false
      }
    });
  } catch (error) {
    logger.error('Error getting 2FA status', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: '2FA_STATUS_ERROR',
        message: 'Failed to get two-factor authentication status'
      }
    });
  }
};

/**
 * Generate backup codes
 * 
 * @route POST /api/v1/security/2fa/backup-codes
 * @access Private
 */
export const generateBackupCodes = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Hash and store backup codes
    const hashedCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    await db.query(SQLQueries.SECURITY.UPDATE_BACKUP_CODES, [hashedCodes, userId]);

    logger.businessEvent('backup_codes_generated', 'user', userId, userId);

    res.json({
      success: true,
      data: {
        backupCodes,
        message: 'Store these codes securely. Each code can only be used once.'
      }
    });
  } catch (error) {
    logger.error('Error generating backup codes', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BACKUP_CODES_ERROR',
        message: 'Failed to generate backup codes'
      }
    });
  }
};

/**
 * Verify backup code
 * 
 * @route POST /api/v1/security/2fa/backup-code
 * @access Private
 */
export const verifyBackupCode = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { backupCode } = req.body;

    if (!backupCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BACKUP_CODE_REQUIRED',
          message: 'Backup code is required'
        }
      });
    }

    // Get user's backup codes using centralized query
    const userResult = await db.query(SQLQueries.SECURITY.GET_BACKUP_CODES, [userId]);
    const user = userResult.rows[0];

    if (!user?.backup_codes || user.backup_codes.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_BACKUP_CODES',
          message: 'No backup codes available'
        }
      });
    }

    // Hash the provided code
    const hashedCode = crypto.createHash('sha256').update(backupCode).digest('hex');

    // Check if code exists and remove it
    const codeIndex = user.backup_codes.indexOf(hashedCode);
    if (codeIndex === -1) {
      logger.warn('Invalid backup code used', { userId });
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BACKUP_CODE',
          message: 'Invalid backup code'
        }
      });
    }

    // Remove used code
    const updatedCodes = user.backup_codes.filter((_, index) => index !== codeIndex);
    await db.query(SQLQueries.SECURITY.UPDATE_BACKUP_CODES, [updatedCodes, userId]);

    logger.businessEvent('backup_code_used', 'user', userId, userId);

    res.json({
      success: true,
      message: 'Backup code verified successfully'
    });
  } catch (error) {
    logger.error('Error verifying backup code', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BACKUP_CODE_VERIFICATION_ERROR',
        message: 'Failed to verify backup code'
      }
    });
  }
};

/**
 * Get security settings
 * 
 * @route GET /api/v1/security/settings
 * @access Private
 */
export const getSecuritySettings = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;

    const userResult = await db.query(SQLQueries.SECURITY.GET_USER_SECURITY_SETTINGS, [userId]);
    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        twoFactorEnabled: user?.two_factor_enabled || false,
        lastPasswordChange: user?.last_password_change,
        failedLoginAttempts: user?.failed_login_attempts || 0,
        accountLockedUntil: user?.account_locked_until,
        hasBackupCodes: user?.backup_codes && user.backup_codes.length > 0
      }
    });
  } catch (error) {
    logger.error('Error getting security settings', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SECURITY_SETTINGS_ERROR',
        message: 'Failed to get security settings'
      }
    });
  }
};

export default {
  setup2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
  generateBackupCodes,
  verifyBackupCode,
  getSecuritySettings
};