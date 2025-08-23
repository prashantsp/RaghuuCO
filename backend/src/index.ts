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
import billingRoutes from './routes/billingRoutes';
import calendarRoutes from './routes/calendarRoutes';
import communicationRoutes from './routes/communicationRoutes';
import reportingRoutes from './routes/reportingRoutes';
import taskRoutes from './routes/taskRoutes';
import documentSecurityRoutes from './routes/documentSecurityRoutes';
import financialDashboardRoutes from './routes/financialDashboardRoutes';
import productivityAnalyticsRoutes from './routes/productivityAnalyticsRoutes';
import customReportBuilderRoutes from './routes/customReportBuilderRoutes';
import clientPortalRoutes from './routes/clientPortalRoutes';
import contentManagementRoutes from './routes/contentManagementRoutes';
import expensesRoutes from './routes/expensesRoutes';
import globalSearchRoutes from './routes/globalSearchRoutes';
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
 * Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', socialAuthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/communication', communicationRoutes);
app.use('/api/v1/reporting', reportingRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/document-security', documentSecurityRoutes);
app.use('/api/v1/financial-dashboard', financialDashboardRoutes);
app.use('/api/v1/productivity-analytics', productivityAnalyticsRoutes);
app.use('/api/v1/custom-report-builder', customReportBuilderRoutes);
app.use('/api/v1/client-portal', clientPortalRoutes);
app.use('/api/v1/content', contentManagementRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/search', globalSearchRoutes);