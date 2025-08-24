"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = googleAuth;
exports.linkedinAuth = linkedinAuth;
exports.microsoftAuth = microsoftAuth;
exports.linkSocialAccount = linkSocialAccount;
exports.unlinkSocialAccount = unlinkSocialAccount;
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
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
async function googleAuth(req, res) {
    try {
        passport_1.default.authenticate('google', { session: false }, async (err, user, info) => {
            if (err) {
                logger_1.default.error('Google OAuth error', err);
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
                logger_1.default.authEvent('google_oauth_failed', undefined, false, req.ip);
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'GOOGLE_OAUTH_FAILED',
                        message: 'Google authentication failed'
                    }
                });
                return;
            }
            let dbUser = await db.getUserByEmail(user.email);
            if (!dbUser) {
                const userData = {
                    email: user.email,
                    firstName: user.firstName || user.displayName?.split(' ')[0] || '',
                    lastName: user.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
                    role: roleAccess_1.UserRole.JUNIOR_ASSOCIATE,
                    isActive: true,
                    emailVerified: true
                };
                dbUser = await db.createUser(userData);
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
                logger_1.default.authEvent('user_registered_google', dbUser.id, true, req.ip);
            }
            else {
                await db.updateSocialAccount(dbUser.id, 'google', {
                    providerId: user.id,
                    displayName: user.displayName,
                    profileUrl: user.profileUrl,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken
                });
                logger_1.default.authEvent('user_login_google', dbUser.id, true, req.ip);
            }
            const accessToken = await (0, auth_1.generateAccessToken)(dbUser.id, dbUser.email, dbUser.role);
            const refreshToken = await (0, auth_1.generateRefreshToken)(dbUser.id);
            await db.createAuditLog({
                userId: dbUser.id,
                action: 'SOCIAL_LOGIN_GOOGLE',
                resourceType: 'users',
                resourceId: dbUser.id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
            res.redirect(redirectUrl);
        })(req, res);
    }
    catch (error) {
        logger_1.default.error('Google OAuth processing failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GOOGLE_OAUTH_PROCESSING_ERROR',
                message: 'Failed to process Google authentication'
            }
        });
    }
}
async function linkedinAuth(req, res) {
    try {
        passport_1.default.authenticate('linkedin', { session: false }, async (err, user, info) => {
            if (err) {
                logger_1.default.error('LinkedIn OAuth error', err);
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
                logger_1.default.authEvent('linkedin_oauth_failed', undefined, false, req.ip);
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'LINKEDIN_OAUTH_FAILED',
                        message: 'LinkedIn authentication failed'
                    }
                });
                return;
            }
            let dbUser = await db.getUserByEmail(user.email);
            if (!dbUser) {
                const userData = {
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    role: roleAccess_1.UserRole.JUNIOR_ASSOCIATE,
                    isActive: true,
                    emailVerified: true
                };
                dbUser = await db.createUser(userData);
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
                logger_1.default.authEvent('user_registered_linkedin', dbUser.id, true, req.ip);
            }
            else {
                await db.updateSocialAccount(dbUser.id, 'linkedin', {
                    providerId: user.id,
                    displayName: user.displayName,
                    profileUrl: user.profileUrl,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken
                });
                logger_1.default.authEvent('user_login_linkedin', dbUser.id, true, req.ip);
            }
            const accessToken = await (0, auth_1.generateAccessToken)(dbUser.id, dbUser.email, dbUser.role);
            const refreshToken = await (0, auth_1.generateRefreshToken)(dbUser.id);
            await db.createAuditLog({
                userId: dbUser.id,
                action: 'SOCIAL_LOGIN_LINKEDIN',
                resourceType: 'users',
                resourceId: dbUser.id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
            res.redirect(redirectUrl);
        })(req, res);
    }
    catch (error) {
        logger_1.default.error('LinkedIn OAuth processing failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LINKEDIN_OAUTH_PROCESSING_ERROR',
                message: 'Failed to process LinkedIn authentication'
            }
        });
    }
}
async function microsoftAuth(req, res) {
    try {
        passport_1.default.authenticate('microsoft', { session: false }, async (err, user, info) => {
            if (err) {
                logger_1.default.error('Microsoft OAuth error', err);
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
                logger_1.default.authEvent('microsoft_oauth_failed', undefined, false, req.ip);
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'MICROSOFT_OAUTH_FAILED',
                        message: 'Microsoft authentication failed'
                    }
                });
                return;
            }
            let dbUser = await db.getUserByEmail(user.email);
            if (!dbUser) {
                const userData = {
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    role: roleAccess_1.UserRole.JUNIOR_ASSOCIATE,
                    isActive: true,
                    emailVerified: true
                };
                dbUser = await db.createUser(userData);
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
                logger_1.default.authEvent('user_registered_microsoft', dbUser.id, true, req.ip);
            }
            else {
                await db.updateSocialAccount(dbUser.id, 'microsoft', {
                    providerId: user.id,
                    displayName: user.displayName,
                    profileUrl: user.profileUrl,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken
                });
                logger_1.default.authEvent('user_login_microsoft', dbUser.id, true, req.ip);
            }
            const accessToken = await (0, auth_1.generateAccessToken)(dbUser.id, dbUser.email, dbUser.role);
            const refreshToken = await (0, auth_1.generateRefreshToken)(dbUser.id);
            await db.createAuditLog({
                userId: dbUser.id,
                action: 'SOCIAL_LOGIN_MICROSOFT',
                resourceType: 'users',
                resourceId: dbUser.id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
            res.redirect(redirectUrl);
        })(req, res);
    }
    catch (error) {
        logger_1.default.error('Microsoft OAuth processing failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MICROSOFT_OAUTH_PROCESSING_ERROR',
                message: 'Failed to process Microsoft authentication'
            }
        });
    }
}
async function linkSocialAccount(req, res) {
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
        logger_1.default.authEvent('social_account_linked', userId, true, req.ip, { provider });
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
    }
    catch (error) {
        logger_1.default.error('Social account linking failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SOCIAL_LINKING_FAILED',
                message: 'Failed to link social account'
            }
        });
    }
}
async function unlinkSocialAccount(req, res) {
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
        await db.deleteSocialAccount(userId, provider);
        logger_1.default.authEvent('social_account_unlinked', userId, true, req.ip, { provider });
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
    }
    catch (error) {
        logger_1.default.error('Social account unlinking failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SOCIAL_UNLINKING_FAILED',
                message: 'Failed to unlink social account'
            }
        });
    }
}
async function verifySocialToken(provider, accessToken) {
    return {
        id: 'social_user_id',
        email: 'user@example.com',
        displayName: 'User Name',
        profileUrl: 'https://provider.com/user'
    };
}
exports.default = {
    googleAuth,
    linkedinAuth,
    microsoftAuth,
    linkSocialAccount,
    unlinkSocialAccount
};
//# sourceMappingURL=socialAuthController.js.map