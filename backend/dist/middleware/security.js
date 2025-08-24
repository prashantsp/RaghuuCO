"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.securityAudit = exports.sensitiveOperationRateLimit = exports.securityHeaders = exports.sessionSecurity = exports.encryptResponse = exports.decryptRequest = exports.ipWhitelist = exports.require2FA = void 0;
const otplib_1 = require("otplib");
const crypto_1 = __importDefault(require("crypto"));
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const redis_1 = require("@/utils/redis");
const db = new DatabaseService_1.default();
const require2FA = async (req, res, next) => {
    try {
        const userId = req.user?.id;
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
        const isValid = otplib_1.authenticator.verify({
            token: totpToken,
            secret: user.two_factor_secret
        });
        if (!isValid) {
            logger_1.default.warn('Invalid TOTP token provided', { userId, ip: req.ip });
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOTP_TOKEN',
                    message: 'Invalid two-factor authentication token'
                }
            });
        }
        logger_1.default.info('2FA validation successful', { userId });
        return next();
    }
    catch (error) {
        logger_1.default.error('Error in 2FA middleware', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'TOTP_VALIDATION_ERROR',
                message: 'Error validating two-factor authentication'
            }
        });
    }
};
exports.require2FA = require2FA;
const ipWhitelist = async (req, res, next) => {
    try {
        const clientIP = req.ip || req.connection.remoteAddress;
        if (!clientIP) {
            logger_1.default.warn('Unable to determine client IP address');
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CLIENT_IP',
                    message: 'Unable to determine client IP address'
                }
            });
        }
        const whitelistedIPs = process.env.IP_WHITELIST?.split(',') || [];
        if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(clientIP)) {
            logger_1.default.warn('Access denied from non-whitelisted IP', {
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
    }
    catch (error) {
        logger_1.default.error('Error in IP whitelist middleware', error);
        return next();
    }
};
exports.ipWhitelist = ipWhitelist;
const decryptRequest = (req, res, next) => {
    try {
        const encryptedData = req.body.encryptedData;
        if (encryptedData) {
            const algorithm = 'aes-256-gcm';
            const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const authTag = Buffer.from(encryptedData.authTag, 'hex');
            const encrypted = Buffer.from(encryptedData.encrypted, 'hex');
            const decipher = crypto_1.default.createDecipher(algorithm, key);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, null, 'utf8');
            decrypted += decipher.final('utf8');
            req.body = JSON.parse(decrypted);
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Error decrypting request', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'DECRYPTION_ERROR',
                message: 'Error decrypting request data'
            }
        });
    }
};
exports.decryptRequest = decryptRequest;
const encryptResponse = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (req.headers['x-encrypt-response'] === 'true') {
            try {
                const algorithm = 'aes-256-gcm';
                const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
                const iv = crypto_1.default.randomBytes(16);
                const cipher = crypto_1.default.createCipher(algorithm, key);
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
            }
            catch (error) {
                logger_1.default.error('Error encrypting response', error);
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
exports.encryptResponse = encryptResponse;
const sessionSecurity = (req, res, next) => {
    try {
        const userAgent = req.get('User-Agent');
        const sessionId = req.session?.id;
        if (sessionId && userAgent) {
            const fingerprint = crypto_1.default
                .createHash('sha256')
                .update(`${sessionId}${userAgent}${req.ip}`)
                .digest('hex');
            req.session.fingerprint = fingerprint;
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Error in session security middleware', error);
        next();
    }
};
exports.sessionSecurity = sessionSecurity;
const securityHeaders = (req, res, next) => {
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'"
    ].join('; '));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
};
exports.securityHeaders = securityHeaders;
const sensitiveOperationRateLimit = (req, res, next) => {
    const clientIP = req.ip;
    const operation = req.path;
    logger_1.default.info('Sensitive operation rate limit check', { clientIP, operation });
    next();
};
exports.sensitiveOperationRateLimit = sensitiveOperationRateLimit;
const securityAudit = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode >= 400) {
            logger_1.default.security('Security event detected', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                userId: req.user?.id
            });
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.securityAudit = securityAudit;
const rateLimit = (options) => {
    return async (req, res, next) => {
        try {
            const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
            const windowKey = `rate_limit:${key}:${Math.floor(Date.now() / options.windowMs)}`;
            const currentCount = await redis_1.redisClient.get(windowKey);
            const count = currentCount ? parseInt(currentCount) : 0;
            if (count >= options.maxRequests) {
                logger_1.default.warn('Rate limit exceeded', {
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
            await redis_1.redisClient.incr(windowKey);
            await redis_1.redisClient.expire(windowKey, Math.ceil(options.windowMs / 1000));
            res.set({
                'X-RateLimit-Limit': options.maxRequests.toString(),
                'X-RateLimit-Remaining': Math.max(0, options.maxRequests - count - 1).toString(),
                'X-RateLimit-Reset': new Date(Date.now() + options.windowMs).toISOString()
            });
            next();
        }
        catch (error) {
            logger_1.default.error('Rate limiting error:', error);
            return next();
        }
    };
};
exports.rateLimit = rateLimit;
exports.default = {
    require2FA: exports.require2FA,
    ipWhitelist: exports.ipWhitelist,
    decryptRequest: exports.decryptRequest,
    encryptResponse: exports.encryptResponse,
    sessionSecurity: exports.sessionSecurity,
    securityHeaders: exports.securityHeaders,
    sensitiveOperationRateLimit: exports.sensitiveOperationRateLimit,
    securityAudit: exports.securityAudit,
    rateLimit: exports.rateLimit
};
//# sourceMappingURL=security.js.map