# RAGHUU CO Legal Practice Management System - Backend

## 📋 Overview

This is the backend API server for the RAGHUU CO Legal Practice Management System, built with Node.js, Express.js, TypeScript, and PostgreSQL. The system provides comprehensive legal practice management functionality with secure authentication, role-based access control, and audit logging.

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with raw SQL queries
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt, helmet, CORS, rate limiting
- **Logging**: Winston with structured logging
- **Validation**: Express-validator with custom validation

### Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── authController.ts # Authentication controller
│   ├── database/             # Database management
│   │   ├── migrations/       # Database migration scripts
│   │   └── migrate.ts        # Migration orchestrator
│   ├── middleware/           # Express middleware
│   │   └── auth.ts          # Authentication & authorization
│   ├── routes/              # API route definitions
│   │   └── authRoutes.ts    # Authentication routes
│   ├── services/            # Business logic services
│   │   └── DatabaseService.ts # Database operations
│   ├── utils/               # Utility functions
│   │   ├── db_SQLQueries.ts # Centralized SQL queries
│   │   ├── logger.ts        # Logging system
│   │   └── roleAccess.ts    # Role-based access control
│   └── index.ts             # Main server file
├── .env.example             # Environment configuration template
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc.json        # Prettier configuration
└── nodemon.json            # Development server configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb raghuuco_legal
   
   # Run database migrations
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "junior_associate",
  "phone": "+91-9876543210"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

#### Logout User
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

#### Get User Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+91-9876543210"
}
```

### Health Check
```http
GET /health
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

#### Required Configuration
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret

#### Optional Configuration
- `FRONTEND_URL`: Frontend URL for CORS
- `LOG_LEVEL`: Logging level
- `RATE_LIMIT_MAX`: Rate limiting requests per 15 minutes

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Database
npm run migrate      # Run database migrations
npm run seed         # Seed database with initial data
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended configuration with TypeScript support
- **Prettier**: Consistent code formatting
- **JSDoc**: Comprehensive documentation for all functions

### Database Management

The system uses raw SQL queries centralized in `src/utils/db_SQLQueries.ts`. All database operations go through the `DatabaseService` class which provides:

- Connection pooling
- Transaction support
- Error handling
- Query logging

### Logging

The application uses Winston for structured logging with the following features:

- Multiple log levels (error, warn, info, debug)
- File and console output
- Request/response logging
- Database query logging
- Authentication event logging
- Security event logging

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management
- Account lockout protection

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention

### Audit Logging
- Comprehensive audit trail for all operations
- User action tracking
- IP address logging
- User agent tracking

## 📊 Monitoring & Health

### Health Check Endpoint
```http
GET /health
```

Returns system health information including:
- Server status
- Uptime
- Environment
- Version

### Logging
All application events are logged with structured data for easy monitoring and debugging.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t raghuuco-backend .

# Run container
docker run -p 3001:3001 --env-file .env raghuuco-backend
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database
- Set up proper CORS origins
- Configure logging for production

## 🤝 Contributing

1. Follow the established code standards
2. Add JSDoc documentation for all new functions
3. Include tests for new features
4. Update this README for significant changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@raghuuco.com
- Documentation: [Link to documentation]
- Issues: [GitHub Issues]

---

**RAGHUU CO Development Team**  
*Version 1.0.0*  
*Last updated: August 24, 2025*