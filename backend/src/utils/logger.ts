/**
 * Logger Configuration
 * Centralized logging system for the RAGHUU CO Legal Practice Management System
 * Enables easy debugging during development with comprehensive logging
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This module provides a comprehensive logging system built on Winston.
 * It includes specialized logging methods for different types of events including
 * database operations, API requests, authentication events, and business operations.
 * 
 * @example
 * ```typescript
 * import logger from '@/utils/logger';
 * 
 * // Log different types of events
 * logger.info('User logged in successfully', { userId: '123' });
 * logger.error('Database connection failed', error);
 * logger.businessEvent('case_created', 'case', 'case-123', 'user-456');
 * ```
 */

import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels: logLevels,
  transports,
});

/**
 * Logger class with additional utility methods
 */
class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = logger;
  }

  /**
   * Log error message
   * @param message - Error message
   * @param error - Error object (optional)
   * @param context - Additional context (optional)
   */
  error(message: string, error?: Error, context?: any): void {
    const logMessage = this.formatMessage(message, context);
    if (error) {
      this.logger.error(`${logMessage} - ${error.message}`, { 
        stack: error.stack,
        context 
      });
    } else {
      this.logger.error(logMessage, { context });
    }
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param context - Additional context (optional)
   */
  warn(message: string, context?: any): void {
    const logMessage = this.formatMessage(message, context);
    this.logger.warn(logMessage, { context });
  }

  /**
   * Log info message
   * @param message - Info message
   * @param context - Additional context (optional)
   */
  info(message: string, context?: any): void {
    const logMessage = this.formatMessage(message, context);
    this.logger.info(logMessage, { context });
  }

  /**
   * Log HTTP request/response
   * @param message - HTTP message
   * @param context - Additional context (optional)
   */
  http(message: string, context?: any): void {
    const logMessage = this.formatMessage(message, context);
    this.logger.http(logMessage, { context });
  }

  /**
   * Log debug message
   * @param message - Debug message
   * @param context - Additional context (optional)
   */
  debug(message: string, context?: any): void {
    const logMessage = this.formatMessage(message, context);
    this.logger.debug(logMessage, { context });
  }

  /**
   * Log database query
   * @param query - SQL query
   * @param params - Query parameters
   * @param duration - Query execution time
   */
  dbQuery(query: string, params: any[] = [], duration?: number): void {
    const message = `DB Query: ${query}`;
    const context = {
      params,
      duration: duration ? `${duration}ms` : undefined,
      type: 'database'
    };
    this.debug(message, context);
  }

  /**
   * Log API request
   * @param method - HTTP method
   * @param url - Request URL
   * @param userId - User ID (optional)
   * @param duration - Request duration (optional)
   */
  apiRequest(method: string, url: string, userId?: string, duration?: number): void {
    const message = `${method} ${url}`;
    const context = {
      userId,
      duration: duration ? `${duration}ms` : undefined,
      type: 'api_request'
    };
    this.http(message, context);
  }

  /**
   * Log authentication event
   * @param event - Authentication event (login, logout, etc.)
   * @param userId - User ID
   * @param success - Whether the event was successful
   * @param ipAddress - IP address (optional)
   */
  authEvent(event: string, userId: string, success: boolean, ipAddress?: string): void {
    const message = `Auth ${event}: ${success ? 'SUCCESS' : 'FAILED'} for user ${userId}`;
    const context = {
      userId,
      success,
      ipAddress,
      type: 'authentication'
    };
    this.info(message, context);
  }

  /**
   * Log security event
   * @param event - Security event description
   * @param userId - User ID (optional)
   * @param ipAddress - IP address (optional)
   * @param details - Additional details (optional)
   */
  securityEvent(event: string, userId?: string, ipAddress?: string, details?: any): void {
    const message = `Security: ${event}`;
    const context = {
      userId,
      ipAddress,
      details,
      type: 'security'
    };
    this.warn(message, context);
  }

  /**
   * Log business event
   * @param event - Business event description
   * @param entityType - Type of entity (case, client, document, etc.)
   * @param entityId - Entity ID
   * @param userId - User ID
   * @param details - Additional details (optional)
   */
  businessEvent(event: string, entityType: string, entityId: string, userId: string, details?: any): void {
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

  /**
   * Log performance metric
   * @param metric - Metric name
   * @param value - Metric value
   * @param unit - Unit of measurement (optional)
   * @param context - Additional context (optional)
   */
  performance(metric: string, value: number, unit?: string, context?: any): void {
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

  /**
   * Format log message with context
   * @param message - Base message
   * @param context - Additional context
   * @returns Formatted message
   */
  private formatMessage(message: string, context?: any): string {
    if (context && typeof context === 'object') {
      const contextStr = JSON.stringify(context, null, 2);
      return `${message} | Context: ${contextStr}`;
    }
    return message;
  }

  /**
   * Create a child logger with additional context
   * @param context - Additional context to include in all logs
   * @returns Child logger instance
   */
  child(context: any): Logger {
    const childLogger = new Logger();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }
}

// Create and export logger instance
const appLogger = new Logger();

// Export both the winston logger and our custom logger
export { logger as winstonLogger, appLogger as logger };
export default appLogger;