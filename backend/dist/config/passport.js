"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_linkedin_oauth2_1 = require("passport-linkedin-oauth2");
const passport_microsoft_1 = require("passport-microsoft");
const passport_local_1 = require("passport-local");
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const auth_1 = require("@/middleware/auth");
const logger_1 = __importDefault(require("@/utils/logger"));
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
const db = new DatabaseService_1.default(databaseConfig);
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
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
        logger_1.default.info('Google OAuth profile received', {
            providerId: profile.id,
            email: user.email
        });
        return done(null, user);
    }
    catch (error) {
        logger_1.default.error('Google OAuth strategy error', error);
        return done(error, null);
    }
}));
passport_1.default.use(new passport_linkedin_oauth2_1.Strategy({
    clientID: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
    try {
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
        logger_1.default.info('LinkedIn OAuth profile received', {
            providerId: profile.id,
            email: user.email
        });
        return done(null, user);
    }
    catch (error) {
        logger_1.default.error('LinkedIn OAuth strategy error', error);
        return done(error, null);
    }
}));
passport_1.default.use(new passport_microsoft_1.Strategy({
    clientID: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/microsoft/callback',
    scope: ['user.read', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
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
        logger_1.default.info('Microsoft OAuth profile received', {
            providerId: profile.id,
            email: user.email
        });
        return done(null, user);
    }
    catch (error) {
        logger_1.default.error('Microsoft OAuth strategy error', error);
        return done(error, null);
    }
}));
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await db.getUserByEmail(email);
        if (!user) {
            logger_1.default.authEvent('local_login_failed', '', false);
            return done(null, false, { message: 'Invalid email or password' });
        }
        if (!user.is_active) {
            logger_1.default.authEvent('local_login_failed', user.id, false);
            return done(null, false, { message: 'Account is disabled' });
        }
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password_hash);
        if (!isValidPassword) {
            logger_1.default.authEvent('local_login_failed', user.id, false);
            return done(null, false, { message: 'Invalid email or password' });
        }
        logger_1.default.authEvent('local_login_success', user.id, true);
        return done(null, user);
    }
    catch (error) {
        logger_1.default.error('Local strategy error', error);
        return done(error, null);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id);
        done(null, user);
    }
    catch (error) {
        logger_1.default.error('User deserialization error', error);
        done(error, null);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map