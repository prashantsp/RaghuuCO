/**
 * Passport.js Configuration
 * OAuth 2.0 authentication strategies for Google, LinkedIn, and Microsoft 365
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This module configures Passport.js authentication strategies for
 * social login providers including Google OAuth 2.0, LinkedIn OAuth 2.0, and
 * Microsoft 365 OAuth 2.0. It handles user profile extraction and token management.
 * 
 * @example
 * ```typescript
 * import passport from '@/config/passport';
 * 
 * // Initialize passport
 * app.use(passport.initialize());
 * 
 * // Use strategies
 * app.get('/api/v1/auth/google', passport.authenticate('google', {
 *   scope: ['profile', 'email']
 * }));
 * ```
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as LocalStrategy } from 'passport-local';
import DatabaseService from '@/services/DatabaseService';
import { comparePassword } from '@/middleware/auth';
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
 * Google OAuth 2.0 Strategy Configuration
 * Authenticates users using Google OAuth 2.0
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // Extract user information from Google profile
    const user = {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      accessToken,
      refreshToken
    };

    logger.info('Google OAuth profile received', { 
      providerId: profile.id, 
      email: user.email 
    });

    return done(null, user);
  } catch (error) {
    logger.error('Google OAuth strategy error', error as Error);
    return done(error, null);
  }
}));

/**
 * LinkedIn OAuth 2.0 Strategy Configuration
 * Authenticates users using LinkedIn OAuth 2.0
 */
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // Extract user information from LinkedIn profile
    const user = {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      accessToken,
      refreshToken
    };

    logger.info('LinkedIn OAuth profile received', { 
      providerId: profile.id, 
      email: user.email 
    });

    return done(null, user);
  } catch (error) {
    logger.error('LinkedIn OAuth strategy error', error as Error);
    return done(error, null);
  }
}));

/**
 * Microsoft 365 OAuth 2.0 Strategy Configuration
 * Authenticates users using Microsoft 365 OAuth 2.0
 */
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/microsoft/callback',
  scope: ['user.read', 'email']
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // Extract user information from Microsoft profile
    const user = {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      displayName: profile.displayName,
      profileUrl: profile.profileUrl,
      accessToken,
      refreshToken
    };

    logger.info('Microsoft OAuth profile received', { 
      providerId: profile.id, 
      email: user.email 
    });

    return done(null, user);
  } catch (error) {
    logger.error('Microsoft OAuth strategy error', error as Error);
    return done(error, null);
  }
}));

/**
 * Local Strategy Configuration
 * Authenticates users using email and password
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email: string, password: string, done: any) => {
  try {
    // Find user by email
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      logger.authEvent('local_login_failed', undefined, false, undefined, { email });
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      logger.authEvent('local_login_failed', user.id, false, undefined, { reason: 'inactive_user' });
      return done(null, false, { message: 'Account is disabled' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      logger.authEvent('local_login_failed', user.id, false, undefined, { reason: 'invalid_password' });
      return done(null, false, { message: 'Invalid email or password' });
    }

    logger.authEvent('local_login_success', user.id, true);
    return done(null, user);
  } catch (error) {
    logger.error('Local strategy error', error as Error);
    return done(error, null);
  }
}));

/**
 * Serialize user for session
 * 
 * @param user - User object
 * @param done - Passport done callback
 */
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 * 
 * @param id - User ID
 * @param done - Passport done callback
 */
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await db.getUserById(id);
    done(null, user);
  } catch (error) {
    logger.error('User deserialization error', error as Error);
    done(error, null);
  }
});

export default passport;