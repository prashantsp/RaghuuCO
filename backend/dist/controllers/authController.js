"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
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
async function register(req, res) {
    try {
        const { email, password, firstName, lastName, role = roleAccess_1.UserRole.JUNIOR_ASSOCIATE, phone } = req.body;
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
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const userData = {
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            role: role,
            ...(phone && { phone }),
            isActive: true,
            emailVerified: false
        };
        const user = await db.createUser(userData);
        const accessToken = await (0, auth_1.generateAccessToken)(user.id, user.email, user.role);
        const refreshToken = await (0, auth_1.generateRefreshToken)(user.id);
        logger_1.default.authEvent('user_registered', user.id, true);
        await db.createAuditLog({
            userId: user.id,
            action: 'USER_REGISTERED',
            resourceType: 'users',
            resourceId: user.id,
            newValues: { email, firstName, lastName, role }
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
    }
    catch (error) {
        logger_1.default.error('User registration failed', error, { email: req.body.email });
        res.status(500).json({
            success: false,
            error: {
                code: 'REGISTRATION_FAILED',
                message: 'Failed to register user'
            }
        });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
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
        const user = await db.getUserByEmail(email);
        if (!user) {
            logger_1.default.authEvent('login_failed', '', false);
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
            return;
        }
        if (!user.is_active) {
            logger_1.default.authEvent('login_failed', user.id, false);
            res.status(401).json({
                success: false,
                error: {
                    code: 'ACCOUNT_DISABLED',
                    message: 'Account is disabled'
                }
            });
            return;
        }
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password_hash);
        if (!isValidPassword) {
            logger_1.default.authEvent('login_failed', user.id, false);
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
            return;
        }
        await db.updateLastLogin(user.id);
        const accessToken = await (0, auth_1.generateAccessToken)(user.id, user.email, user.role);
        const refreshToken = await (0, auth_1.generateRefreshToken)(user.id);
        logger_1.default.authEvent('login_success', user.id, true);
        await db.createAuditLog({
            userId: user.id,
            action: 'USER_LOGIN',
            resourceType: 'users',
            resourceId: user.id
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
    }
    catch (error) {
        logger_1.default.error('User login failed', error, { email: req.body.email });
        res.status(500).json({
            success: false,
            error: {
                code: 'LOGIN_FAILED',
                message: 'Failed to authenticate user'
            }
        });
    }
}
async function refreshToken(req, res) {
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
        const decoded = await db.queryOne('SELECT * FROM user_sessions WHERE refresh_token = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP', [refreshToken]);
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
        const newAccessToken = await (0, auth_1.generateAccessToken)(user.id, user.email, user.role);
        const newRefreshToken = await (0, auth_1.generateRefreshToken)(user.id);
        await db.query('UPDATE user_sessions SET refresh_token = $1, expires_at = $2 WHERE refresh_token = $3', [newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), refreshToken]);
        logger_1.default.authEvent('token_refreshed', user.id, true);
        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        logger_1.default.error('Token refresh failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'REFRESH_FAILED',
                message: 'Failed to refresh token'
            }
        });
    }
}
async function logout(req, res) {
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
        await db.query('UPDATE user_sessions SET is_active = false WHERE refresh_token = $1', [refreshToken]);
        if (userId) {
            logger_1.default.authEvent('logout_success', userId, true);
            await db.createAuditLog({
                userId,
                action: 'USER_LOGOUT',
                resourceType: 'users',
                resourceId: userId
            });
        }
        res.status(200).json({
            success: true,
            message: 'Successfully logged out'
        });
    }
    catch (error) {
        logger_1.default.error('Logout failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOGOUT_FAILED',
                message: 'Failed to logout'
            }
        });
    }
}
async function getProfile(req, res) {
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
    }
    catch (error) {
        logger_1.default.error('Get profile failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_FETCH_FAILED',
                message: 'Failed to fetch user profile'
            }
        });
    }
}
async function updateProfile(req, res) {
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
        await db.createAuditLog({
            userId,
            action: 'PROFILE_UPDATED',
            resourceType: 'users',
            resourceId: userId,
            newValues: { firstName, lastName, phone }
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
    }
    catch (error) {
        logger_1.default.error('Update profile failed', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_UPDATE_FAILED',
                message: 'Failed to update user profile'
            }
        });
    }
}
exports.default = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile
};
//# sourceMappingURL=authController.js.map