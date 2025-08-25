# RAGHUU CO Legal Practice Management System - Agent Guide

## 🎯 Project Overview

This is a comprehensive legal practice management system built with modern web technologies. The system provides end-to-end case management, document handling, client communication, billing, and reporting capabilities.

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Node.js 18 + Express.js + TypeScript + PostgreSQL
- **Database**: PostgreSQL 14 with Redis for caching
- **DevOps**: Docker + Docker Compose + Nginx + Prometheus + Grafana
- **Testing**: Jest + Vitest + Testing Library
- **Code Quality**: ESLint + Prettier + TypeScript

### **Project Structure**
```
/
├── frontend/                 # React frontend application
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── backend/                 # Node.js backend API
│   ├── src/                 # Source code
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── database/        # Database models and migrations
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   └── package.json         # Backend dependencies
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
├── monitoring/              # Monitoring configuration
├── nginx/                   # Nginx configuration
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
└── package.json             # Root package.json with scripts
```

## 🚀 Quick Start for Agents

### **1. Environment Setup**

#### **Prerequisites**
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 7.x or higher
- Docker and Docker Compose (optional)

#### **Installation Steps**
```bash
# Clone and navigate to project
cd /workspace

# Install all dependencies
npm run install:all

# Set up environment variables (create .env files)
# See Environment Configuration section below

# Start development servers
npm run dev
```

### **2. Environment Configuration**

#### **Root .env file**
Create a `.env` file in the root directory:
```env
# Application
NODE_ENV=development
PORT=5000
FRONTEND_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raghuuco
DB_USER=raghuuco_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# External APIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

#### **Backend .env file**
Create a `.env` file in the `backend/` directory:
```env
# Copy from root .env and add backend-specific variables
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raghuuco
DB_USER=raghuuco_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log
```

#### **Frontend .env file**
Create a `.env` file in the `frontend/` directory:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000

# External Services
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PWA=true
```

### **3. Database Setup**

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE raghuuco;
CREATE USER raghuuco_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE raghuuco TO raghuuco_user;
\q

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### **4. Development Commands**

#### **Root Level Commands**
```bash
# Development
npm run dev                    # Start both frontend and backend
npm run dev:backend           # Start backend only
npm run dev:frontend          # Start frontend only

# Building
npm run build                 # Build both frontend and backend
npm run build:backend         # Build backend only
npm run build:frontend        # Build frontend only

# Testing
npm run test                  # Run all tests
npm run test:backend          # Run backend tests
npm run test:frontend         # Run frontend tests
npm run test:coverage         # Run tests with coverage

# Code Quality
npm run lint                  # Run linting
npm run lint:fix              # Fix linting issues
npm run format                # Format code
npm run type-check            # Type checking

# Database
npm run db:migrate            # Run database migrations
npm run db:seed               # Seed database
npm run db:reset              # Reset database
npm run db:backup             # Backup database
npm run db:restore            # Restore database

# Docker
npm run docker:build          # Build Docker images
npm run docker:up             # Start Docker containers
npm run docker:down           # Stop Docker containers
npm run docker:logs           # View Docker logs

# Monitoring
npm run monitoring:start      # Start monitoring stack
npm run monitoring:stop       # Stop monitoring stack
npm run monitoring:logs       # View monitoring logs

# Security
npm run security:audit        # Run security audit
npm run security:scan         # Run security scan

# Performance
npm run performance:test      # Run performance tests
npm run load:test             # Run load tests
npm run stress:test           # Run stress tests
```

#### **Backend Commands**
```bash
cd backend

# Development
npm run dev                   # Start development server
npm run build                 # Build TypeScript
npm run start                 # Start production server

# Testing
npm run test                  # Run tests
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Run tests with coverage

# Code Quality
npm run lint                  # Run linting
npm run lint:fix              # Fix linting issues

# Database
npm run db:migrate            # Run migrations
npm run db:seed               # Seed database
```

#### **Frontend Commands**
```bash
cd frontend

# Development
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview               # Preview production build

# Testing
npm run test                  # Run tests
npm run test:ui               # Run tests with UI
npm run test:coverage         # Run tests with coverage

# Code Quality
npm run lint                  # Run linting
npm run lint:fix              # Fix linting issues
npm run format                # Format code
npm run type-check            # Type checking
```

## 🔧 Common Issues and Solutions

### **1. Missing Dependencies**
If you encounter missing module errors:
```bash
# Install missing dependencies
npm install

# If specific modules are missing, add them to package.json
npm install <module-name> --save-dev
```

### **2. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Check Redis status
sudo systemctl status redis

# Start Redis if not running
sudo systemctl start redis
```

### **3. Port Conflicts**
If ports are already in use:
```bash
# Check what's using the port
sudo lsof -i :5000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### **4. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /workspace
chmod -R 755 /workspace
```

## 📁 Key Files and Directories

### **Configuration Files**
- `package.json` - Root package configuration
- `backend/package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies
- `backend/tsconfig.json` - TypeScript configuration
- `frontend/tsconfig.json` - Frontend TypeScript configuration
- `backend/.eslintrc.js` - ESLint configuration
- `frontend/vite.config.ts` - Vite configuration
- `docker-compose.yml` - Docker development setup
- `docker-compose.prod.yml` - Docker production setup

### **Source Code Structure**
- `backend/src/controllers/` - API route handlers
- `backend/src/routes/` - API route definitions
- `backend/src/services/` - Business logic
- `backend/src/middleware/` - Express middleware
- `backend/src/database/` - Database models and migrations
- `backend/src/config/` - Configuration files
- `backend/src/utils/` - Utility functions
- `frontend/src/components/` - React components
- `frontend/src/pages/` - Page components
- `frontend/src/services/` - API services
- `frontend/src/store/` - Redux store
- `frontend/src/utils/` - Utility functions

### **Scripts and Tools**
- `scripts/check-jsdoc.js` - JSDoc compliance checker
- `scripts/check-sql-centralization.js` - SQL centralization checker
- `scripts/check-access-control.js` - Access control checker
- `scripts/deploy-production.sh` - Production deployment script

## 🧪 Testing Strategy

### **Backend Testing**
- Unit tests for controllers and services
- Integration tests for API endpoints
- Database migration tests
- Authentication and authorization tests

### **Frontend Testing**
- Component unit tests
- Integration tests for user flows
- E2E tests for critical paths
- Accessibility tests

### **Performance Testing**
- Load testing with k6
- Stress testing for system limits
- Memory and CPU profiling

## 🔒 Security Considerations

### **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- OAuth 2.0 integration for social login

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### **File Security**
- Secure file upload validation
- Virus scanning for uploaded files
- Access control for file downloads
- Audit logging for file operations

## 📊 Monitoring and Logging

### **Application Monitoring**
- Prometheus metrics collection
- Grafana dashboards
- Health check endpoints
- Performance monitoring

### **Logging**
- Structured logging with Winston
- Log rotation and archiving
- Error tracking and alerting
- Audit logging for security events

## 🚀 Deployment

### **Development Deployment**
```bash
# Start development environment
npm run dev

# Or use Docker
docker-compose up -d
```

### **Production Deployment**
```bash
# Build and deploy
npm run build
npm run deploy:production

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

### **Staging Deployment**
```bash
# Deploy to staging
npm run deploy:staging
```

## 📚 Additional Resources

### **Documentation**
- `README.md` - Main project documentation
- `backend/README.md` - Backend-specific documentation
- `docs/` - Additional documentation

### **API Documentation**
- API endpoints are documented in route files
- Swagger/OpenAPI documentation available at `/api/docs`
- Postman collection available in `docs/`

### **Code Standards**
- TypeScript strict mode enabled
- ESLint with Prettier for code formatting
- Conventional commit messages
- Branch naming: `feature/`, `bugfix/`, `hotfix/`

## 🆘 Troubleshooting

### **Common Error Messages**

#### **"Cannot find module"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **"Database connection failed"**
```bash
# Check database status
sudo systemctl status postgresql
sudo systemctl status redis

# Check environment variables
cat .env
```

#### **"Port already in use"**
```bash
# Find and kill process
sudo lsof -i :5000
sudo kill -9 <PID>
```

#### **"Permission denied"**
```bash
# Fix permissions
sudo chown -R $USER:$USER /workspace
chmod -R 755 /workspace
```

### **Getting Help**
1. Check the logs: `npm run logs:all`
2. Review error messages in console
3. Check environment configuration
4. Verify database connectivity
5. Check file permissions

## 🔄 Version Control

### **Branch Strategy**
- `main` - Production-ready code
- `development_branch` - Development integration
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes

### **Commit Guidelines**
- Use conventional commit messages
- Include issue numbers when applicable
- Write descriptive commit messages
- Keep commits atomic and focused

---

**Last Updated**: 2025-08-24
**Version**: 1.0.0
**Maintainer**: RAGHUU CO Development Team