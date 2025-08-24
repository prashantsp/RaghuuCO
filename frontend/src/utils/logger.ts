/**
 * Frontend Logging Utility
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Centralized logging utility for frontend components with different log levels
 */

/**
 * Log levels for frontend logging
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  component?: string;
  userId?: string;
}

/**
 * Frontend Logger Class
 * Provides centralized logging functionality for frontend components
 */
class FrontendLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

  /**
   * Set the minimum log level
   * 
   * @param level - The minimum log level to display
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Check if a log level should be displayed
   * 
   * @param level - The log level to check
   * @returns True if the level should be displayed
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  /**
   * Create a log entry
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context data
   * @param component - Component name
   * @returns Formatted log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: any,
    component?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      component,
      userId: this.getCurrentUserId()
    };
  }

  /**
   * Get current user ID from localStorage or session
   * 
   * @returns Current user ID or undefined
   */
  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id;
      }
    } catch (error) {
      // Silently fail if user data is not available
    }
    return undefined;
  }

  /**
   * Log an error message
   * 
   * @param message - Error message
   * @param error - Error object or additional context
   * @param component - Component name (optional)
   * 
   * @example
   * ```typescript
   * logger.error('Failed to fetch user data', error, 'UserProfile');
   * ```
   */
  error(message: string, error?: any, component?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const logEntry = this.createLogEntry(LogLevel.ERROR, message, error, component);
    
    if (this.isDevelopment) {
      console.error(`[${logEntry.timestamp}] [ERROR] ${component ? `[${component}] ` : ''}${message}`, error);
    } else {
      // In production, send to error tracking service
      this.sendToErrorTracking(logEntry);
    }
  }

  /**
   * Log a warning message
   * 
   * @param message - Warning message
   * @param context - Additional context data
   * @param component - Component name (optional)
   * 
   * @example
   * ```typescript
   * logger.warn('User session expiring soon', { expiresIn: '5min' }, 'AuthService');
   * ```
   */
  warn(message: string, context?: any, component?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const logEntry = this.createLogEntry(LogLevel.WARN, message, context, component);
    
    if (this.isDevelopment) {
      console.warn(`[${logEntry.timestamp}] [WARN] ${component ? `[${component}] ` : ''}${message}`, context);
    }
  }

  /**
   * Log an info message
   * 
   * @param message - Info message
   * @param context - Additional context data
   * @param component - Component name (optional)
   * 
   * @example
   * ```typescript
   * logger.info('User logged in successfully', { userId: '123' }, 'AuthService');
   * ```
   */
  info(message: string, context?: any, component?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const logEntry = this.createLogEntry(LogLevel.INFO, message, context, component);
    
    if (this.isDevelopment) {
      console.info(`[${logEntry.timestamp}] [INFO] ${component ? `[${component}] ` : ''}${message}`, context);
    }
  }

  /**
   * Log a debug message
   * 
   * @param message - Debug message
   * @param context - Additional context data
   * @param component - Component name (optional)
   * 
   * @example
   * ```typescript
   * logger.debug('API request sent', { url: '/api/users', method: 'GET' }, 'ApiService');
   * ```
   */
  debug(message: string, context?: any, component?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const logEntry = this.createLogEntry(LogLevel.DEBUG, message, context, component);
    
    if (this.isDevelopment) {
      console.debug(`[${logEntry.timestamp}] [DEBUG] ${component ? `[${component}] ` : ''}${message}`, context);
    }
  }

  /**
   * Log a business event
   * 
   * @param event - Event name
   * @param entity - Entity type
   * @param entityId - Entity ID
   * @param userId - User ID (optional)
   * @param context - Additional context data
   * 
   * @example
   * ```typescript
   * logger.businessEvent('case_created', 'case', 'case-123', 'user-456', { priority: 'high' });
   * ```
   */
  businessEvent(
    event: string,
    entity: string,
    entityId: string,
    userId?: string,
    context?: any
  ): void {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      `Business Event: ${event}`,
      { event, entity, entityId, userId, ...context },
      'BusinessEvent'
    );

    if (this.isDevelopment) {
      console.info(`[${logEntry.timestamp}] [BUSINESS] ${event}`, logEntry.context);
    } else {
      // In production, send to analytics service
      this.sendToAnalytics(logEntry);
    }
  }

  /**
   * Log user interaction
   * 
   * @param action - User action
   * @param component - Component name
   * @param context - Additional context data
   * 
   * @example
   * ```typescript
   * logger.userInteraction('button_click', 'UserForm', { buttonId: 'save', formData: {...} });
   * ```
   */
  userInteraction(action: string, component: string, context?: any): void {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      `User Interaction: ${action}`,
      { action, component, ...context },
      'UserInteraction'
    );

    if (this.isDevelopment) {
      console.info(`[${logEntry.timestamp}] [INTERACTION] ${action}`, logEntry.context);
    } else {
      // In production, send to analytics service
      this.sendToAnalytics(logEntry);
    }
  }

  /**
   * Log API request
   * 
   * @param method - HTTP method
   * @param url - Request URL
   * @param status - Response status
   * @param duration - Request duration in milliseconds
   * @param context - Additional context data
   * 
   * @example
   * ```typescript
   * logger.apiRequest('GET', '/api/users', 200, 150, { userId: '123' });
   * ```
   */
  apiRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: any
  ): void {
    const logEntry = this.createLogEntry(
      LogLevel.INFO,
      `API Request: ${method} ${url}`,
      { method, url, status, duration, ...context },
      'ApiService'
    );

    if (this.isDevelopment) {
      console.info(`[${logEntry.timestamp}] [API] ${method} ${url} - ${status} (${duration}ms)`, context);
    }
  }

  /**
   * Send error to error tracking service
   * 
   * @param logEntry - Log entry to send
   */
  private sendToErrorTracking(logEntry: LogEntry): void {
    // In production, this would send to services like Sentry, LogRocket, etc.
    // For now, we'll just store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('frontend_errors') || '[]');
      errors.push(logEntry);
      localStorage.setItem('frontend_errors', JSON.stringify(errors.slice(-50))); // Keep last 50 errors
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Send analytics data to analytics service
   * 
   * @param logEntry - Log entry to send
   */
  private sendToAnalytics(logEntry: LogEntry): void {
    // In production, this would send to services like Google Analytics, Mixpanel, etc.
    // For now, we'll just store in localStorage for debugging
    try {
      const analytics = JSON.parse(localStorage.getItem('frontend_analytics') || '[]');
      analytics.push(logEntry);
      localStorage.setItem('frontend_analytics', JSON.stringify(analytics.slice(-100))); // Keep last 100 events
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Get stored errors for debugging
   * 
   * @returns Array of stored error logs
   */
  getStoredErrors(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('frontend_errors') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Get stored analytics for debugging
   * 
   * @returns Array of stored analytics logs
   */
  getStoredAnalytics(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('frontend_analytics') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem('frontend_errors');
      localStorage.removeItem('frontend_analytics');
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }
}

// Export singleton instance
export const logger = new FrontendLogger();

// Export for convenience
export default logger;