"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.winstonLogger = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
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
winston.addColors(logColors);
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
const transports = [
    new winston.transports.Console({
        format: logFormat,
    }),
    new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    }),
    new winston.transports.File({
        filename: path.join('logs', 'combined.log'),
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    }),
];
const logger = winston.createLogger({
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