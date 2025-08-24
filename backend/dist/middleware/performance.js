"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitor = exports.cacheWarming = exports.memoryMonitor = exports.dbQueryOptimization = exports.responseOptimization = exports.queryOptimization = exports.requestSizeLimit = exports.etagMiddleware = exports.cacheControl = exports.compressionMiddleware = exports.responseTimeMonitor = void 0;
const compression_1 = __importDefault(require("compression"));
const logger_1 = require("@/utils/logger");
const cacheService_1 = __importDefault(require("@/services/cacheService"));
const responseTimeMonitor = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;
        if (duration > 1000) {
            logger_1.logger.warn('Slow API request detected', {
                method,
                url: originalUrl,
                statusCode,
                duration: `${duration}ms`,
                userAgent: req.get('User-Agent')
            });
        }
        logger_1.logger.info('API request completed', {
            method,
            url: originalUrl,
            statusCode,
            duration: `${duration}ms`
        });
    });
    next();
};
exports.responseTimeMonitor = responseTimeMonitor;
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        if (res.getHeader('Content-Encoding')) {
            return false;
        }
        const contentLength = parseInt(res.getHeader('Content-Length'));
        if (contentLength && contentLength < 1024) {
            return false;
        }
        return compression_1.default.filter(req, res);
    }
});
const cacheControl = (maxAge = 300) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            return next();
        }
        if (req.user && req.path.includes('/api/v1/auth')) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            return next();
        }
        res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
        res.set('Vary', 'Accept-Encoding');
        next();
    };
};
exports.cacheControl = cacheControl;
const etagMiddleware = (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }
    const etag = `"${Buffer.from(`${req.originalUrl}:${req.user?.id || 'anonymous'}`).toString('base64')}"`;
    if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
    }
    res.set('ETag', etag);
    next();
};
exports.etagMiddleware = etagMiddleware;
const requestSizeLimit = (limit = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const limitBytes = parseSize(limit);
        if (contentLength > limitBytes) {
            return res.status(413).json({
                success: false,
                error: {
                    code: 'REQUEST_TOO_LARGE',
                    message: `Request size exceeds limit of ${limit}`
                }
            });
        }
        next();
    };
};
exports.requestSizeLimit = requestSizeLimit;
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
    if (!match) {
        return 1024 * 1024;
    }
    const [, value, unit] = match;
    return parseFloat(value) * units[unit];
}
const queryOptimization = (req, res, next) => {
    const limit = parseInt(req.query.limit) || 50;
    const maxLimit = 1000;
    if (limit > maxLimit) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_LIMIT',
                message: `Limit cannot exceed ${maxLimit}`
            }
        });
    }
    req.query.limit = limit.toString();
    req.query.page = req.query.page || '1';
    if (req.query.search) {
        const search = req.query.search;
        if (search.length < 2) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SEARCH',
                    message: 'Search query must be at least 2 characters long'
                }
            });
        }
    }
    next();
};
exports.queryOptimization = queryOptimization;
const responseOptimization = (req, res, next) => {
    res.set('X-Response-Time', '0ms');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    const originalJson = res.json;
    res.json = function (data) {
        const cleanData = removeNullValues(data);
        res.set('Content-Type', 'application/json; charset=utf-8');
        return originalJson.call(this, cleanData);
    };
    next();
};
exports.responseOptimization = responseOptimization;
function removeNullValues(obj) {
    if (obj === null || obj === undefined) {
        return undefined;
    }
    if (Array.isArray(obj)) {
        return obj.map(removeNullValues).filter(item => item !== undefined);
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanedValue = removeNullValues(value);
            if (cleanedValue !== undefined) {
                cleaned[key] = cleanedValue;
            }
        }
        return cleaned;
    }
    return obj;
}
const dbQueryOptimization = (req, res, next) => {
    req.queryTimeout = 30000;
    req.queryOptimization = {
        useIndex: true,
        limitResults: true,
        cacheResults: true
    };
    next();
};
exports.dbQueryOptimization = dbQueryOptimization;
const memoryMonitor = (req, res, next) => {
    const startMemory = process.memoryUsage();
    res.on('finish', () => {
        const endMemory = process.memoryUsage();
        const memoryDiff = {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external
        };
        if (memoryDiff.heapUsed > 50 * 1024 * 1024) {
            logger_1.logger.warn('High memory usage detected', {
                url: req.originalUrl,
                method: req.method,
                memoryDiff: {
                    rss: `${Math.round(memoryDiff.rss / 1024 / 1024)}MB`,
                    heapUsed: `${Math.round(memoryDiff.heapUsed / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(memoryDiff.heapTotal / 1024 / 1024)}MB`,
                    external: `${Math.round(memoryDiff.external / 1024 / 1024)}MB`
                }
            });
        }
    });
    next();
};
exports.memoryMonitor = memoryMonitor;
const cacheWarming = (req, res, next) => {
    if (req.method === 'GET' && req.path.includes('/api/v1/dashboard')) {
        setImmediate(async () => {
            try {
                const cacheKey = `dashboard:${req.user?.id || 'anonymous'}`;
                const cached = await cacheService_1.default.get(cacheKey);
                if (!cached) {
                    logger_1.logger.debug('Cache warming triggered for dashboard');
                }
            }
            catch (error) {
                logger_1.logger.error('Cache warming error:', error);
            }
        });
    }
    next();
};
exports.cacheWarming = cacheWarming;
const performanceMonitor = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        logger_1.logger.info('Request performance metrics', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
        if (duration > 1000) {
            logger_1.logger.warn('Slow request detected', {
                method: req.method,
                url: req.originalUrl,
                duration: `${duration.toFixed(2)}ms`
            });
        }
    });
    next();
};
exports.performanceMonitor = performanceMonitor;
exports.default = {
    responseTimeMonitor: exports.responseTimeMonitor,
    compressionMiddleware: exports.compressionMiddleware,
    cacheControl: exports.cacheControl,
    etagMiddleware: exports.etagMiddleware,
    requestSizeLimit: exports.requestSizeLimit,
    queryOptimization: exports.queryOptimization,
    responseOptimization: exports.responseOptimization,
    dbQueryOptimization: exports.dbQueryOptimization,
    memoryMonitor: exports.memoryMonitor,
    cacheWarming: exports.cacheWarming,
    performanceMonitor: exports.performanceMonitor
};
//# sourceMappingURL=performance.js.map