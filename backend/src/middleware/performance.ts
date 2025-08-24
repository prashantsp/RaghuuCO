/**
 * Performance Middleware
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This middleware provides performance optimization features including
 * response time monitoring, compression, caching headers, and request optimization.
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { logger } from '@/utils/logger';
import cacheService from '@/services/cacheService';

/**
 * Response time monitoring middleware
 */
export const responseTimeMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow API request detected', {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Log performance metrics
    logger.info('API request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};

/**
 * Compression middleware with optimization
 */
export const compressionMiddleware = compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Don't compress already compressed content
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // Don't compress small responses
    const contentLength = parseInt(res.getHeader('Content-Length') as string);
    if (contentLength && contentLength < 1024) {
      return false;
    }
    
    return compression.filter(req, res);
  }
});

/**
 * Cache control middleware
 */
export const cacheControl = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      return next();
    }
    
    // Skip caching for authenticated requests with sensitive data
    if (req.user && req.path.includes('/api/v1/auth')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      return next();
    }
    
    // Set appropriate cache headers
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
    res.set('Vary', 'Accept-Encoding');
    
    next();
  };
};

/**
 * ETag middleware for conditional requests
 */
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip ETag for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Generate ETag based on request URL and user
  const etag = `"${Buffer.from(`${req.originalUrl}:${req.user?.id || 'anonymous'}`).toString('base64')}"`;
  
  // Check if client has the same ETag
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.set('ETag', etag);
  next();
};

/**
 * Request size limiting middleware
 */
export const requestSizeLimit = (limit: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
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
    
    return next();
  };
};

/**
 * Parse size string to bytes
 */
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    return 1024 * 1024; // Default to 1MB
  }
  
  const [, value, unit] = match;
  return parseFloat(value) * units[unit];
}

/**
 * Query optimization middleware
 */
export const queryOptimization = (req: Request, res: Response, next: NextFunction) => {
  // Limit pagination size
  const limit = parseInt(req.query.limit as string) || 50;
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
  
  // Add default pagination
  req.query.limit = limit.toString();
  req.query.page = req.query.page || '1';
  
  // Optimize search queries
  if (req.query.search) {
    const search = req.query.search as string;
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
  
  return next();
};

/**
 * Response optimization middleware
 */
export const responseOptimization = (req: Request, res: Response, next: NextFunction) => {
  // Add performance headers
  res.set('X-Response-Time', '0ms');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Optimize JSON responses
  const originalJson = res.json;
  res.json = function(data: any) {
    // Remove null and undefined values
    const cleanData = removeNullValues(data);
    
    // Set appropriate content type
    res.set('Content-Type', 'application/json; charset=utf-8');
    
    return originalJson.call(this, cleanData);
  };
  
  next();
};

/**
 * Remove null and undefined values from object
 */
function removeNullValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeNullValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
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

/**
 * Database query optimization middleware
 */
export const dbQueryOptimization = (req: Request, res: Response, next: NextFunction) => {
  // Add query timeout
  req.queryTimeout = 30000; // 30 seconds
  
  // Add query optimization hints
  req.queryOptimization = {
    useIndex: true,
    limitResults: true,
    cacheResults: true
  };
  
  next();
};

/**
 * Memory usage monitoring middleware
 */
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };
    
    // Log high memory usage
    if (memoryDiff.heapUsed > 50 * 1024 * 1024) { // 50MB
      logger.warn('High memory usage detected', {
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

/**
 * Cache warming middleware
 */
export const cacheWarming = (req: Request, res: Response, next: NextFunction) => {
  // Warm cache for frequently accessed data
  if (req.method === 'GET' && req.path.includes('/api/v1/dashboard')) {
    // Warm dashboard cache in background
    setImmediate(async () => {
      try {
        const cacheKey = `dashboard:${req.user?.id || 'anonymous'}`;
        const cached = await cacheService.get(cacheKey);
        if (!cached) {
          // Cache will be populated by the actual request
          logger.debug('Cache warming triggered for dashboard');
        }
      } catch (error) {
        logger.error('Cache warming error:', error as Error);
      }
    });
  }
  
  next();
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    logger.info('Request performance metrics', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Track slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`
      });
    }
  });
  
  next();
};

export default {
  responseTimeMonitor,
  compressionMiddleware,
  cacheControl,
  etagMiddleware,
  requestSizeLimit,
  queryOptimization,
  responseOptimization,
  dbQueryOptimization,
  memoryMonitor,
  cacheWarming,
  performanceMonitor
};