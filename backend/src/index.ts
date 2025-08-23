/**
 * Main Server File
 * RAGHUU CO Legal Practice Management System - Backend API Server
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This is the main entry point for the RAGHUU CO Legal Practice Management System
 * backend API server. It sets up Express.js with all necessary middleware, security
 * configurations, and API routes. The server implements comprehensive logging,
 * error handling, and health monitoring.
 * 
 * @example
 * ```bash
 * # Start development server
 * npm run dev
 * 
 * # Start production server
 * npm start
 * ```
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createSchema } from './database/migrate';
import logger from './utils/logger';
import authRoutes from './routes/authRoutes';
import socialAuthRoutes from './routes/socialAuthRoutes';
import userRoutes from './routes/userRoutes';
import clientRoutes from './routes/clientRoutes';
import caseRoutes from './routes/caseRoutes';
import documentRoutes from './routes/documentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import passport from './config/passport';

// Load environment variables
dotenv.config();

/**
 * Express application instance
 */
const app = express();

/**
 * Server port configuration
 * @default 3001
 */
const PORT = process.env.PORT || 3001;

/**
 * Security middleware configuration
 * Implements comprehensive security headers and protections
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

/**
 * CORS configuration for cross-origin requests
 * Allows frontend application to communicate with the API
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * Rate limiting configuration
 * Prevents abuse by limiting requests per IP address
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

/**
 * Compression middleware for response optimization
 */
app.use(compression());

/**
 * Body parsing middleware for JSON and URL-encoded data
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Passport.js initialization
 * Required for social authentication strategies
 */
app.use(passport.initialize());

/**
 * HTTP request logging middleware
 * Logs all incoming requests for monitoring and debugging
 */
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    }
  }
}));

/**
 * Request timing middleware
 * Measures and logs request processing time
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.apiRequest(req.method, req.url, undefined, duration);
  });
  
  next();
});

/**
 * Health check endpoint
 * Provides system health status for monitoring and load balancers
 * 
 * @route GET /health
 * @returns {Object} Health status information
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(health);
  } catch (error) {
    logger.error('Health check failed', error as Error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable'
    });
  }
});

/**
 * API root endpoint
 * Provides basic API information and version details
 * 
 * @route GET /api/v1
 * @returns {Object} API information
 */
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'RAGHUU CO Legal Practice Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Mount authentication routes
 * All authentication-related endpoints are prefixed with /api/v1/auth
 */
app.use('/api/v1/auth', authRoutes);

/**
 * Mount social authentication routes
 * OAuth 2.0 authentication endpoints for Google, LinkedIn, and Microsoft 365
 */
app.use('/api/v1/auth', socialAuthRoutes);

/**
 * Mount user management routes
 * User CRUD operations and role-based access control
 */
app.use('/api/v1/users', userRoutes);

/**
 * Mount client management routes
 * Client CRUD operations and conflict checking
 */
app.use('/api/v1/clients', clientRoutes);

/**
 * Mount case management routes
 * Case CRUD operations and workflow management
 */
app.use('/api/v1/cases', caseRoutes);

/**
 * Mount document management routes
 * Document upload, versioning, and search functionality
 */
app.use('/api/v1/documents', documentRoutes);

/**
 * Mount dashboard routes
 * Dashboard statistics and analytics
 */
app.use('/api/v1/dashboard', dashboardRoutes);

/**
 * Global error handling middleware
 * Catches and logs all unhandled errors
 * 
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err, {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    }
  });
});

/**
 * 404 handler for undefined routes
 * Returns standardized error response for non-existent endpoints
 */
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

/**
 * Graceful shutdown handlers
 * Ensures proper cleanup when the server is terminated
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

/**
 * Unhandled promise rejection handler
 * Logs unhandled promise rejections for debugging
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Uncaught exception handler
 * Logs uncaught exceptions and terminates the process
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Server initialization function
 * Sets up database schema and starts the HTTP server
 * 
 * @async
 * @returns {Promise<void>}
 */
async function startServer(): Promise<void> {
  try {
    // Initialize database schema in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Initializing database schema...');
      await createSchema();
    }

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;