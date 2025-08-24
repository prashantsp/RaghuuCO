"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logClientActivity = exports.validateDocumentAccess = exports.validateCaseAccess = exports.clientPortalRateLimit = exports.optionalClientAuth = exports.authenticateClientUser = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
const authenticateClientUser = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'NO_SESSION_TOKEN',
                    message: 'No session token provided'
                }
            });
        }
        const sessionResult = await db.query(`
      SELECT cps.*, cpu.email, cpu.first_name, cpu.last_name, cpu.client_id, c.name as client_name
      FROM client_portal_sessions cps
      JOIN client_portal_users cpu ON cps.client_user_id = cpu.id
      JOIN clients c ON cpu.client_id = c.id
      WHERE cps.session_token = $1 AND cps.expires_at > NOW()
    `, [sessionToken]);
        const session = sessionResult.rows[0];
        if (!session) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_SESSION',
                    message: 'Invalid or expired session'
                }
            });
        }
        const userResult = await db.query(`
      SELECT * FROM client_portal_users WHERE id = $1 AND status = 'active'
    `, [session.client_user_id]);
        const clientUser = userResult.rows[0];
        if (!clientUser) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INACTIVE_ACCOUNT',
                    message: 'Client account is inactive'
                }
            });
        }
        req.clientUser = {
            id: clientUser.id,
            email: clientUser.email,
            firstName: clientUser.first_name,
            lastName: clientUser.last_name,
            clientId: clientUser.client_id,
            clientName: session.client_name
        };
        logger_1.default.info('Client portal user authenticated', {
            clientUserId: clientUser.id,
            clientId: clientUser.client_id,
            ip: req.ip
        });
        next();
    }
    catch (error) {
        logger_1.default.error('Error authenticating client user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_AUTHENTICATION_ERROR',
                message: 'Authentication failed'
            }
        });
    }
};
exports.authenticateClientUser = authenticateClientUser;
const optionalClientAuth = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (sessionToken) {
            const sessionResult = await db.query(`
        SELECT cps.*, cpu.email, cpu.first_name, cpu.last_name, cpu.client_id, c.name as client_name
        FROM client_portal_sessions cps
        JOIN client_portal_users cpu ON cps.client_user_id = cpu.id
        JOIN clients c ON cpu.client_id = c.id
        WHERE cps.session_token = $1 AND cps.expires_at > NOW()
      `, [sessionToken]);
            const session = sessionResult.rows[0];
            if (session) {
                const userResult = await db.query(`
          SELECT * FROM client_portal_users WHERE id = $1 AND status = 'active'
        `, [session.client_user_id]);
                const clientUser = userResult.rows[0];
                if (clientUser) {
                    req.clientUser = {
                        id: clientUser.id,
                        email: clientUser.email,
                        firstName: clientUser.first_name,
                        lastName: clientUser.last_name,
                        clientId: clientUser.client_id,
                        clientName: session.client_name
                    };
                }
            }
        }
        next();
    }
    catch (error) {
        logger_1.default.warn('Optional client authentication failed', error);
        next();
    }
};
exports.optionalClientAuth = optionalClientAuth;
const clientPortalRateLimit = (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 100;
    if (!req.app.locals.rateLimit) {
        req.app.locals.rateLimit = new Map();
    }
    const rateLimit = req.app.locals.rateLimit;
    const clientRequests = rateLimit.get(clientId) || { count: 0, resetTime: now + windowMs };
    if (now > clientRequests.resetTime) {
        clientRequests.count = 1;
        clientRequests.resetTime = now + windowMs;
    }
    else {
        clientRequests.count++;
    }
    rateLimit.set(clientId, clientRequests);
    if (clientRequests.count > maxRequests) {
        return res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests, please try again later'
            }
        });
    }
    next();
};
exports.clientPortalRateLimit = clientPortalRateLimit;
const validateCaseAccess = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const clientId = req.clientUser?.clientId;
        if (!clientId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }
        const caseResult = await db.query(`
      SELECT id FROM cases WHERE id = $1 AND client_id = $2
    `, [caseId, clientId]);
        if (!caseResult.rows[0]) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Access denied to this case'
                }
            });
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Error validating case access', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CASE_ACCESS_VALIDATION_ERROR',
                message: 'Failed to validate case access'
            }
        });
    }
};
exports.validateCaseAccess = validateCaseAccess;
const validateDocumentAccess = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const clientId = req.clientUser?.clientId;
        if (!clientId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }
        const documentResult = await db.query(`
      SELECT d.id FROM documents d
      JOIN cases c ON d.case_id = c.id
      WHERE d.id = $1 AND c.client_id = $2
    `, [documentId, clientId]);
        if (!documentResult.rows[0]) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Access denied to this document'
                }
            });
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Error validating document access', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DOCUMENT_ACCESS_VALIDATION_ERROR',
                message: 'Failed to validate document access'
            }
        });
    }
};
exports.validateDocumentAccess = validateDocumentAccess;
const logClientActivity = (action) => {
    return async (req, res, next) => {
        try {
            const clientUserId = req.clientUser?.id;
            const clientId = req.clientUser?.clientId;
            if (clientUserId) {
                await db.query(`
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
          VALUES ($1, $2, $3, $4, $5)
        `, [
                    clientUserId,
                    action,
                    'client_portal',
                    clientId,
                    JSON.stringify({
                        ip: req.ip,
                        userAgent: req.get('User-Agent'),
                        timestamp: new Date().toISOString()
                    })
                ]);
            }
            next();
        }
        catch (error) {
            logger_1.default.warn('Failed to log client activity', error);
            next();
        }
    };
};
exports.logClientActivity = logClientActivity;
exports.default = {
    authenticateClientUser: exports.authenticateClientUser,
    optionalClientAuth: exports.optionalClientAuth,
    clientPortalRateLimit: exports.clientPortalRateLimit,
    validateCaseAccess: exports.validateCaseAccess,
    validateDocumentAccess: exports.validateDocumentAccess,
    logClientActivity: exports.logClientActivity
};
//# sourceMappingURL=clientPortalAuth.js.map