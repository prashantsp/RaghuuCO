/**
 * Security Middleware
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Advanced security middleware including 2FA, IP whitelisting, and encryption
 */

import { Request, Response, NextFunction } from 'express';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';
import { redisClient } from '@/utils/redis';

const db = new DatabaseService();

/**
 * Two-Factor Authentication middleware
 * Validates TOTP tokens for protected routes
 */
export const require2FA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)?.id;
    const { totpToken } = req.body;

    if (!totpToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOTP_TOKEN_REQUIRED',
          message: 'Two-factor authentication token is required'
        }
      });
    }

    // Get user's 2FA secret from database
    const userResult = await db.query('SELECT two_factor_secret FROM users WHERE id = $1', [userId]);
    const user = userResult[0];

    if (!user?.two_factor_secret) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOTP_NOT_SETUP',
          message: 'Two-factor authentication is not set up for this user'
        }
      });
    }

    // Validate TOTP token
    const isValid = authenticator.verify({
      token: totpToken,
      secret: user.two_factor_secret
    });

    if (!isValid) {
              (logger as any).warn('Invalid TOTP token provided', { userId, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOTP_TOKEN',
          message: 'Invalid two-factor authentication token'
        }
      });
    }

          (logger as any).info('2FA validation successful', { userId });
    return next();
  } catch (error) {
          (logger as any).error('Error in 2FA middleware', error as Error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'TOTP_VALIDATION_ERROR',
        message: 'Error validating two-factor authentication'
      }
    });
  }
};

/**
 * IP Whitelisting middleware
 * Validates client IP against whitelist
 */
export const ipWhitelist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!clientIP) {
      (logger as any).warn('Unable to determine client IP address');
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CLIENT_IP',
          message: 'Unable to determine client IP address'
        }
      });
    }
    
    // Get IP whitelist from environment or database
    const whitelistedIPs = process.env.IP_WHITELIST?.split(',') || [];
    
    if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(clientIP)) {
      (logger as any).warn('Access denied from non-whitelisted IP', { 
        clientIP, 
        whitelistedIPs,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'IP_NOT_WHITELISTED',
          message: 'Access denied from this IP address'
        }
      });
    }

    next();
  } catch (error) {
    (logger as any).error('Error in IP whitelist middleware', error as Error);
    return next();
  }
};

/**
 * Request Encryption middleware
 * Decrypts encrypted request bodies
 */
export const decryptRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const encryptedData = req.body.encryptedData;
    
    if (encryptedData) {
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');
      const encrypted = Buffer.from(encryptedData.encrypted, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      req.body = JSON.parse(decrypted);
    }
    
    next();
  } catch (error) {
    (logger as any).error('Error decrypting request', error as Error);
    res.status(400).json({
      success: false,
      error: {
        code: 'DECRYPTION_ERROR',
        message: 'Error decrypting request data'
      }
    });
  }
};

/**
 * Response Encryption middleware
 * Encrypts response bodies
 */
export const encryptResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (req.headers['x-encrypt-response'] === 'true') {
      try {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        cipher.setAAD(Buffer.from('RAGHUU_CO', 'utf8'));
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        const encryptedResponse = {
          encryptedData: {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
          }
        };
        
        return originalJson.call(this, encryptedResponse);
      } catch (error) {
        (logger as any).error('Error encrypting response', error as Error);
        return originalJson.call(this, {
          success: false,
          error: {
            code: 'ENCRYPTION_ERROR',
            message: 'Error encrypting response data'
          }
        });
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Session Security middleware
 * Validates session security parameters
 */
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAgent = req.get('User-Agent');
    const sessionId = req.session?.id;
    
    if (sessionId && userAgent) {
      // Store session fingerprint for validation
      const fingerprint = crypto
        .createHash('sha256')
        .update(`${sessionId}${userAgent}${req.ip}`)
        .digest('hex');
      
      req.session.fingerprint = fingerprint;
    }
    
    next();
  } catch (error) {
    (logger as any).error('Error in session security middleware', error as Error);
    next();
  }
};

/**
 * Content Security Policy middleware
 * Sets security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; '));
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * Rate limiting for sensitive operations
 */
export const sensitiveOperationRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip;
  const operation = req.path;
  
  // Implement rate limiting logic here
  // This is a simplified version - in production, use Redis or similar
  
      (logger as any).info('Sensitive operation rate limit check', { clientIP, operation });
  next();
};

/**
 * Audit logging for security events
 */
export const securityAudit = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log security-relevant events
    if (res.statusCode >= 400) {
      (logger as any).security('Security event detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userId: (req.user as any)?.id
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Rate limiting middleware
 * Implements sliding window rate limiting with Redis
 */
export const rateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
      const windowKey = `rate_limit:${key}:${Math.floor(Date.now() / options.windowMs)}`;
      
      // Get current request count
      const currentCount = await redisClient.get(windowKey);
      const count = currentCount ? parseInt(currentCount) : 0;
      
      if (count >= options.maxRequests) {
        (logger as any).warn('Rate limit exceeded', {
          ip: req.ip,
          key,
          count,
          maxRequests: options.maxRequests,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: options.windowMs / 1000
        });
      }
      
      // Increment request count
      await redisClient.incr(windowKey);
      await redisClient.expire(windowKey, Math.ceil(options.windowMs / 1000));
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': options.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, options.maxRequests - count - 1).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + options.windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      (logger as any).error('Rate limiting error:', error as Error);
      // Continue without rate limiting if Redis is unavailable
      return next();
    }
  };
};

export default {
  require2FA,
  ipWhitelist,
  decryptRequest,
  encryptResponse,
  sessionSecurity,
  securityHeaders,
  sensitiveOperationRateLimit,
  securityAudit,
  rateLimit
};