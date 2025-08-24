/**
 * Error Handler Utility
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This utility provides comprehensive error handling, logging,
 * and error reporting capabilities for the frontend application.
 */

import { logger } from './logger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  UI = 'ui',
  API = 'api',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

/**
 * Error context interface
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  referrer?: string;
  screenSize?: string;
  browser?: string;
  os?: string;
  [key: string]: any;
}

/**
 * Error information interface
 */
export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  metadata?: Record<string, any>;
  timestamp: Date;
  handled: boolean;
  reported: boolean;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableErrorReporting: boolean;
  enableErrorBoundary: boolean;
  enablePerformanceMonitoring: boolean;
  maxErrorsPerMinute: number;
  errorReportingEndpoint?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Error boundary state interface
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

/**
 * Performance error interface
 */
export interface PerformanceError {
  type: 'timeout' | 'memory' | 'network' | 'rendering';
  message: string;
  duration?: number;
  threshold?: number;
  context: ErrorContext;
}

/**
 * Error Handler Class
 */
class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errors: ErrorInfo[] = [];
  private errorCount: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();
  private isInitialized = false;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: true,
      enableErrorReporting: true,
      enableErrorBoundary: true,
      enablePerformanceMonitoring: true,
      maxErrorsPerMinute: 10,
      logLevel: 'error',
      ...config
    };
  }

  /**
   * Initialize error handler
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      // Set up performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }

      // Set up network error monitoring
      this.setupNetworkErrorMonitoring();

      // Set up unhandled promise rejection handler
      this.setupPromiseRejectionHandler();

      this.isInitialized = true;
      logger.info('Error handler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize error handler:', error);
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        context: this.getErrorContext()
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        context: this.getErrorContext()
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError(new Error(`Resource loading error: ${event.target}`), {
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          context: this.getErrorContext()
        });
      }
    }, true);
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // 50ms threshold
            this.handlePerformanceError({
              type: 'rendering',
              message: `Long task detected: ${entry.duration}ms`,
              duration: entry.duration,
              threshold: 50,
              context: this.getErrorContext()
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMemoryMB = memory.usedJSHeapSize / 1024 / 1024;
        const memoryLimitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        
        if (usedMemoryMB > memoryLimitMB * 0.8) { // 80% threshold
          this.handlePerformanceError({
            type: 'memory',
            message: `High memory usage: ${usedMemoryMB.toFixed(2)}MB / ${memoryLimitMB.toFixed(2)}MB`,
            context: this.getErrorContext()
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Setup network error monitoring
   */
  private setupNetworkErrorMonitoring(): void {
    // Monitor fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.handleError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
            category: ErrorCategory.NETWORK,
            severity: ErrorSeverity.MEDIUM,
            context: this.getErrorContext()
          });
        }
        
        return response;
      } catch (error) {
        this.handleError(error as Error, {
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.HIGH,
          context: this.getErrorContext()
        });
        throw error;
      }
    };
  }

  /**
   * Setup promise rejection handler
   */
  private setupPromiseRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      
      this.handleError(new Error(`Unhandled promise rejection: ${event.reason}`), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        context: this.getErrorContext()
      });
    });
  }

  /**
   * Handle error
   */
  handleError(
    error: Error,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      context?: Partial<ErrorContext>;
      metadata?: Record<string, any>;
    } = {}
  ): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date();
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      severity: options.severity || ErrorSeverity.MEDIUM,
      category: options.category || ErrorCategory.UNKNOWN,
      context: {
        ...this.getErrorContext(),
        ...options.context
      },
      metadata: options.metadata,
      timestamp,
      handled: false,
      reported: false
    };

    // Add to errors array
    this.errors.push(errorInfo);

    // Check rate limiting
    if (this.isRateLimited(errorInfo)) {
      logger.warn('Error rate limited', { errorId, category: errorInfo.category });
      return errorId;
    }

    // Log error
    this.logError(errorInfo);

    // Report error if enabled
    if (this.config.enableErrorReporting) {
      this.reportError(errorInfo);
    }

    // Update error count
    this.updateErrorCount(errorInfo);

    return errorId;
  }

  /**
   * Handle performance error
   */
  handlePerformanceError(perfError: PerformanceError): void {
    const error = new Error(perfError.message);
    this.handleError(error, {
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.LOW,
      context: perfError.context,
      metadata: {
        type: perfError.type,
        duration: perfError.duration,
        threshold: perfError.threshold
      }
    });
  }

  /**
   * Handle API error
   */
  handleApiError(
    error: Error,
    endpoint: string,
    method: string,
    statusCode?: number,
    responseData?: any
  ): string {
    return this.handleError(error, {
      category: ErrorCategory.API,
      severity: statusCode && statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      context: {
        ...this.getErrorContext(),
        endpoint,
        method,
        statusCode,
        responseData
      }
    });
  }

  /**
   * Handle validation error
   */
  handleValidationError(
    error: Error,
    field?: string,
    value?: any,
    validationRules?: string[]
  ): string {
    return this.handleError(error, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      context: {
        ...this.getErrorContext(),
        field,
        value,
        validationRules
      }
    });
  }

  /**
   * Handle authentication error
   */
  handleAuthenticationError(error: Error, action?: string): string {
    return this.handleError(error, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context: {
        ...this.getErrorContext(),
        action
      }
    });
  }

  /**
   * Handle authorization error
   */
  handleAuthorizationError(error: Error, resource?: string, action?: string): string {
    return this.handleError(error, {
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      context: {
        ...this.getErrorContext(),
        resource,
        action
      }
    });
  }

  /**
   * Get error context
   */
  private getErrorContext(): ErrorContext {
    return {
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      browser: this.getBrowserInfo(),
      os: this.getOSInfo()
    };
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  /**
   * Get OS information
   */
  private getOSInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if error is rate limited
   */
  private isRateLimited(errorInfo: ErrorInfo): boolean {
    const key = `${errorInfo.category}_${errorInfo.severity}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old entries
    if (this.lastErrorTime.has(key) && this.lastErrorTime.get(key)! < oneMinuteAgo) {
      this.errorCount.delete(key);
      this.lastErrorTime.delete(key);
    }

    const count = this.errorCount.get(key) || 0;
    
    if (count >= this.config.maxErrorsPerMinute) {
      return true;
    }

    this.errorCount.set(key, count + 1);
    this.lastErrorTime.set(key, now);
    
    return false;
  }

  /**
   * Log error
   */
  private logError(errorInfo: ErrorInfo): void {
    if (!this.config.enableConsoleLogging) {
      return;
    }

    const logMessage = {
      id: errorInfo.id,
      message: errorInfo.message,
      severity: errorInfo.severity,
      category: errorInfo.category,
      timestamp: errorInfo.timestamp,
      context: errorInfo.context
    };

    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('Critical error occurred', logMessage);
        break;
      case ErrorSeverity.HIGH:
        logger.error('High severity error occurred', logMessage);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity error occurred', logMessage);
        break;
      case ErrorSeverity.LOW:
        logger.info('Low severity error occurred', logMessage);
        break;
    }
  }

  /**
   * Report error to remote service
   */
  private async reportError(errorInfo: ErrorInfo): Promise<void> {
    if (!this.config.errorReportingEndpoint) {
      return;
    }

    try {
      const response = await fetch(this.config.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });

      if (response.ok) {
        errorInfo.reported = true;
        logger.info('Error reported successfully', { errorId: errorInfo.id });
      } else {
        logger.warn('Failed to report error', { errorId: errorInfo.id, status: response.status });
      }
    } catch (error) {
      logger.error('Error reporting failed', { errorId: errorInfo.id, error });
    }
  }

  /**
   * Update error count
   */
  private updateErrorCount(errorInfo: ErrorInfo): void {
    const key = `${errorInfo.category}_${errorInfo.severity}`;
    const count = this.errorCount.get(key) || 0;
    this.errorCount.set(key, count + 1);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorInfo[];
  } {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const recentErrors = this.errors.filter(error => 
      error.timestamp.getTime() > oneHourAgo
    );

    const errorsByCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.AUTHENTICATION]: 0,
      [ErrorCategory.AUTHORIZATION]: 0,
      [ErrorCategory.DATABASE]: 0,
      [ErrorCategory.UI]: 0,
      [ErrorCategory.API]: 0,
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.UNKNOWN]: 0
    };

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    };

    this.errors.forEach(error => {
      errorsByCategory[error.category]++;
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors
    };
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.errors = [];
    this.errorCount.clear();
    this.lastErrorTime.clear();
    logger.info('Error history cleared');
  }

  /**
   * Get error by ID
   */
  getErrorById(errorId: string): ErrorInfo | undefined {
    return this.errors.find(error => error.id === errorId);
  }

  /**
   * Mark error as handled
   */
  markErrorAsHandled(errorId: string): void {
    const error = this.getErrorById(errorId);
    if (error) {
      error.handled = true;
      logger.info('Error marked as handled', { errorId });
    }
  }

  /**
   * Get configuration
   */
  getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Error handler configuration updated', { newConfig });
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export utility functions
export const handleError = (error: Error, options?: any) => errorHandler.handleError(error, options);
export const handleApiError = (error: Error, endpoint: string, method: string, statusCode?: number, responseData?: any) => 
  errorHandler.handleApiError(error, endpoint, method, statusCode, responseData);
export const handleValidationError = (error: Error, field?: string, value?: any, validationRules?: string[]) => 
  errorHandler.handleValidationError(error, field, value, validationRules);
export const handleAuthenticationError = (error: Error, action?: string) => 
  errorHandler.handleAuthenticationError(error, action);
export const handleAuthorizationError = (error: Error, resource?: string, action?: string) => 
  errorHandler.handleAuthorizationError(error, resource, action);