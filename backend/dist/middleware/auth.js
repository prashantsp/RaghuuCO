"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
exports.authenticateToken = authenticateToken;
exports.authorizeRole = authorizeRole;
exports.authorizePermission = authorizePermission;
exports.authorizeAnyPermission = authorizeAnyPermission;
exports.authorizeAllPermissions = authorizeAllPermissions;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const roleAccess_1 = require("@/utils/roleAccess");
const logger_1 = __importDefault(require("@/utils/logger"));
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '3600';
const REFRESH_TOKEN_EXPIRES_IN = process.env['REFRESH_TOKEN_EXPIRES_IN'] || '604800';
async function generateAccessToken(userId, email, role) {
    try {
        const payload = {
            id: userId,
            email,
            role,
            permissions: [],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + parseInt(JWT_EXPIRES_IN)
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: parseInt(JWT_EXPIRES_IN) });
        logger_1.default.authEvent('token_generated', userId, true, undefined);
        return token;
    }
    catch (error) {
        logger_1.default.error('Failed to generate access token', error, { userId, email, role });
        throw new Error('Token generation failed');
    }
}
async function generateRefreshToken(userId) {
    try {
        const payload = {
            id: userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + parseInt(REFRESH_TOKEN_EXPIRES_IN)
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: parseInt(REFRESH_TOKEN_EXPIRES_IN) });
        logger_1.default.authEvent('refresh_token_generated', userId, true, undefined);
        return token;
    }
    catch (error) {
        logger_1.default.error('Failed to generate refresh token', error, { userId });
        throw new Error('Refresh token generation failed');
    }
}
async function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        logger_1.default.error('Token verification failed', error);
        throw new Error('Invalid token');
    }
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        logger_1.default.securityEvent('authentication_failed', undefined, req.ip, { reason: 'no_token' });
        res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_MISSING',
                message: 'Access token required'
            }
        });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            logger_1.default.securityEvent('authentication_failed', undefined, req.ip, {
                reason: 'invalid_token',
                error: err.message
            });
            res.status(403).json({
                success: false,
                error: {
                    code: 'TOKEN_INVALID',
                    message: 'Invalid or expired token'
                }
            });
            return;
        }
        req.user = decoded;
        logger_1.default.authEvent('token_validated', decoded.id, true, req.ip);
        next();
    });
}
function authorizeRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            logger_1.default.securityEvent('authorization_failed', req.user.id, req.ip, {
                requiredRoles: roles,
                userRole: req.user.role
            });
            res.status(403).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'Access denied - insufficient permissions'
                }
            });
            return;
        }
        logger_1.default.authEvent('authorization_success', req.user.id, true, req.ip);
        next();
    };
}
function authorizePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        if (!(0, roleAccess_1.hasPermission)(req.user.role, permission)) {
            logger_1.default.securityEvent('permission_denied', req.user.id, req.ip, {
                requiredPermission: permission,
                userRole: req.user.role
            });
            res.status(403).json({
                success: false,
                error: {
                    code: 'PERMISSION_DENIED',
                    message: 'Access denied - permission required'
                }
            });
            return;
        }
        logger_1.default.authEvent('permission_granted', req.user.id, true, req.ip);
        next();
    };
}
function authorizeAnyPermission(permissions) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        const hasAnyPermission = permissions.some(permission => (0, roleAccess_1.hasPermission)(req.user.role, permission));
        if (!hasAnyPermission) {
            logger_1.default.securityEvent('permission_denied', req.user.id, req.ip, {
                requiredPermissions: permissions,
                userRole: req.user.role
            });
            res.status(403).json({
                success: false,
                error: {
                    code: 'PERMISSION_DENIED',
                    message: 'Access denied - insufficient permissions'
                }
            });
            return;
        }
        logger_1.default.authEvent('permission_granted', req.user.id, true, req.ip);
        next();
    };
}
function authorizeAllPermissions(permissions) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        const hasAllPermissions = permissions.every(permission => (0, roleAccess_1.hasPermission)(req.user.role, permission));
        if (!hasAllPermissions) {
            logger_1.default.securityEvent('permission_denied', req.user.id, req.ip, {
                requiredPermissions: permissions,
                userRole: req.user.role
            });
            res.status(403).json({
                success: false,
                error: {
                    code: 'PERMISSION_DENIED',
                    message: 'Access denied - insufficient permissions'
                }
            });
            return;
        }
        logger_1.default.authEvent('permission_granted', req.user.id, true, req.ip);
        next();
    };
}
async function hashPassword(password, saltRounds = 12) {
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        return hashedPassword;
    }
    catch (error) {
        logger_1.default.error('Password hashing failed', error);
        throw new Error('Password hashing failed');
    }
}
async function comparePassword(password, hashedPassword) {
    try {
        const isValid = await bcryptjs_1.default.compare(password, hashedPassword);
        return isValid;
    }
    catch (error) {
        logger_1.default.error('Password comparison failed', error);
        return false;
    }
}
exports.default = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    authenticateToken,
    authorizeRole,
    authorizePermission,
    authorizeAnyPermission,
    authorizeAllPermissions,
    hashPassword,
    comparePassword
};
//# sourceMappingURL=auth.js.map