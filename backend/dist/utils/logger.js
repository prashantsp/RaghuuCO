"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.winstonLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(logColors);
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
const transports = [
    new winston_1.default.transports.Console({
        format: logFormat,
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    }),
];
const logger = winston_1.default.createLogger({
    level: level(),
    levels: logLevels,
    transports,
});
exports.winstonLogger = logger;
class Logger {
    constructor() {
        this.logger = logger;
    }
    error(message, error, context) {
        const logMessage = this.formatMessage(message, context);
        if (error) {
            this.logger.error(`${logMessage} - ${error.message}`, {
                stack: error.stack,
                context
            });
        }
        else {
            this.logger.error(logMessage, { context });
        }
    }
    warn(message, context) {
        const logMessage = this.formatMessage(message, context);
        this.logger.warn(logMessage, { context });
    }
    info(message, context) {
        const logMessage = this.formatMessage(message, context);
        this.logger.info(logMessage, { context });
    }
    http(message, context) {
        const logMessage = this.formatMessage(message, context);
        this.logger.http(logMessage, { context });
    }
    debug(message, context) {
        const logMessage = this.formatMessage(message, context);
        this.logger.debug(logMessage, { context });
    }
    dbQuery(query, params = [], duration) {
        const message = `DB Query: ${query}`;
        const context = {
            params,
            duration: duration ? `${duration}ms` : undefined,
            type: 'database'
        };
        this.debug(message, context);
    }
    apiRequest(method, url, userId, duration) {
        const message = `${method} ${url}`;
        const context = {
            userId,
            duration: duration ? `${duration}ms` : undefined,
            type: 'api_request'
        };
        this.http(message, context);
    }
    authEvent(event, userId, success, ipAddress) {
        const message = `Auth ${event}: ${success ? 'SUCCESS' : 'FAILED'} for user ${userId}`;
        const context = {
            userId,
            success,
            ipAddress,
            type: 'authentication'
        };
        this.info(message, context);
    }
    securityEvent(event, userId, ipAddress, details) {
        const message = `Security: ${event}`;
        const context = {
            userId,
            ipAddress,
            details,
            type: 'security'
        };
        this.warn(message, context);
    }
    businessEvent(event, entityType, entityId, userId, details) {
        const message = `Business: ${event} on ${entityType} ${entityId}`;
        const context = {
            entityType,
            entityId,
            userId,
            details,
            type: 'business'
        };
        this.info(message, context);
    }
    performance(metric, value, unit, context) {
        const message = `Performance: ${metric} = ${value}${unit ? ` ${unit}` : ''}`;
        const logContext = {
            metric,
            value,
            unit,
            type: 'performance',
            ...context
        };
        this.info(message, logContext);
    }
    formatMessage(message, context) {
        if (context && typeof context === 'object') {
            const contextStr = JSON.stringify(context, null, 2);
            return `${message} | Context: ${contextStr}`;
        }
        return message;
    }
    child(context) {
        const childLogger = new Logger();
        childLogger.logger = this.logger.child(context);
        return childLogger;
    }
}
const appLogger = new Logger();
exports.logger = appLogger;
exports.default = appLogger;
//# sourceMappingURL=logger.js.map