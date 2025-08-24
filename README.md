# RAGHUU CO Legal Practice Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## 🎯 Overview

RAGHUU CO Legal Practice Management System is a comprehensive, modern legal practice management solution designed specifically for Indian legal firms. The system provides end-to-end case management, document handling, client communication, billing, and reporting capabilities with advanced features like AI-powered search, real-time collaboration, and mobile accessibility.

### **Key Highlights:**
- **Modern Architecture**: Built with React, Node.js, and PostgreSQL
- **AI-Powered Features**: Machine learning for search and recommendations
- **Real-time Collaboration**: WebSocket-based real-time updates
- **Mobile-First Design**: Responsive design with PWA capabilities
- **Enterprise Security**: Role-based access control and audit logging
- **Multi-language Support**: Hindi and English language support
- **Accessibility Compliant**: WCAG 2.1 AA compliance

## ✨ Features

### **Core Features**
- **Case Management**: Complete case lifecycle management
- **Document Management**: Advanced document handling with version control
- **Client Portal**: Secure client communication and document sharing
- **Billing & Invoicing**: Automated billing and payment tracking
- **Calendar & Scheduling**: Integrated calendar with reminders
- **Reporting & Analytics**: Comprehensive business intelligence reports
- **User Management**: Role-based access control and permissions

### **Advanced Features**
- **AI-Powered Search**: Full-text search with machine learning
- **Real-time Collaboration**: Live updates and notifications
- **Mobile Application**: Progressive Web App (PWA)
- **Offline Capability**: Offline data synchronization
- **Multi-language Support**: Hindi and English interfaces
- **Accessibility**: Screen reader support and keyboard navigation
- **Training System**: Interactive training modules and progress tracking
- **Support System**: Integrated support tickets and feedback collection
- **Knowledge Base**: Searchable help documentation and tutorials

## 🛠 Technology Stack

### **Frontend**
- **React 18**: Modern UI framework with hooks
- **Material-UI (MUI)**: Component library for consistent design
- **TypeScript**: Type-safe JavaScript development
- **Redux Toolkit**: State management
- **Vite**: Fast build tool and development server
- **PWA**: Progressive Web App capabilities

### **Backend**
- **Node.js 18**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL 14**: Primary database with full-text search
- **Redis**: Caching and session management
- **Passport.js**: Authentication with OAuth 2.0
- **Joi**: Request validation and sanitization

### **DevOps & Infrastructure**
- **Docker**: Containerization for consistent deployment
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and load balancing
- **Prometheus**: Monitoring and metrics collection
- **Grafana**: Visualization and alerting
- **ELK Stack**: Logging and analysis
- **GitHub Actions**: CI/CD pipeline automation

### **Security & Compliance**
- **JWT**: Secure token-based authentication
- **OAuth 2.0**: Social login integration
- **RBAC**: Role-based access control
- **Audit Logging**: Comprehensive security auditing
- **SSL/TLS**: End-to-end encryption
- **GDPR Compliance**: Data protection compliance

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 7.x or higher
- Docker and Docker Compose (for production deployment)

### **Quick Installation (Development)**
```bash
# Clone the repository
git clone https://github.com/raghuuco/legal-practice-management.git
cd legal-practice-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### **Quick Installation (Production)**
```bash
# Clone the repository
git clone https://github.com/raghuuco/legal-practice-management.git
cd legal-practice-management

# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

## 📦 Installation

### **Step 1: System Requirements**

#### **Minimum Requirements**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **OS**: Linux, macOS, or Windows

#### **Recommended Requirements**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

### **Step 2: Install Dependencies**

#### **Ubuntu/Debian**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### **macOS**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node@18
brew install postgresql@14
brew install redis
brew install docker docker-compose
```

#### **Windows**
```bash
# Install Node.js from https://nodejs.org/
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# Install Redis from https://redis.io/download
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

### **Step 3: Database Setup**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE raghuuco;
CREATE USER raghuuco_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE raghuuco TO raghuuco_user;
\q

# Run database migrations
npm run migrate
```

### **Step 4: Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### **Required Environment Variables**
```env
# Database
DATABASE_URL=postgresql://raghuuco_user:your_password@localhost:5432/raghuuco

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# AWS Configuration (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name
AWS_REGION=your_aws_region

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## 💻 Development Setup

### **1. Clone Repository**
```bash
git clone https://github.com/raghuuco/legal-practice-management.git
cd legal-practice-management
```

### **2. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### **3. Development Scripts**
```bash
# Start development servers
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

### **4. Development Tools**
```bash
# Database management
npm run db:migrate    # Run migrations
npm run db:seed       # Seed test data
npm run db:reset      # Reset database

# Code quality
npm run lint          # ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Prettier formatting
npm run type-check    # TypeScript checking

# Testing
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # End-to-end tests
```

## 🚀 Deployment

### **Development Deployment**
```bash
# Start development environment
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
# Redis: localhost:6379
```

### **Staging Deployment**
```bash
# Deploy to staging environment
docker-compose -f docker-compose.staging.yml up -d

# Access staging environment
# Application: http://localhost:8080
# Grafana: http://localhost:3003
# Kibana: http://localhost:5602
```

### **Production Deployment**
```bash
# Deploy to production
docker-compose -f docker-compose.production.yml up -d

# Or use the deployment script
./scripts/deploy-production.sh
```

### **Environment-Specific Configurations**

#### **Development Environment**
- Hot reloading enabled
- Debug logging enabled
- Test data available
- Development tools accessible

#### **Staging Environment**
- Production-like configuration
- Automated testing
- Performance monitoring
- Security scanning

#### **Production Environment**
- Optimized for performance
- Security hardened
- Monitoring and alerting
- Automated backups

## 📚 API Documentation

The complete API documentation is available at:
- **Interactive API Docs**: `/api/docs` (when running)
- **API Documentation**: [docs/API_Documentation.md](docs/API_Documentation.md)
- **Postman Collection**: [docs/postman/RaghuuCO_API.postman_collection.json](docs/postman/RaghuuCO_API.postman_collection.json)

### **Quick API Examples**
```bash
# Authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get cases
curl -X GET http://localhost:3001/api/cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create case
curl -X POST http://localhost:3001/api/cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Case","description":"Case description"}'
```

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

### **Contributing Guidelines**

#### **1. Fork and Clone**
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/legal-practice-management.git
cd legal-practice-management

# Add upstream remote
git remote add upstream https://github.com/raghuuco/legal-practice-management.git
```

#### **2. Create Feature Branch**
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Follow coding standards and conventions
```

#### **3. Commit Changes**
```bash
# Add changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/your-feature-name
```

#### **4. Submit Pull Request**
- Create a pull request on GitHub
- Provide detailed description of changes
- Include tests for new features
- Ensure all tests pass

### **Development Standards**

#### **Code Style**
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Include JSDoc comments for functions

#### **Testing**
- Write unit tests for new features
- Ensure test coverage is maintained
- Run integration tests before submitting
- Include end-to-end tests for critical paths

#### **Documentation**
- Update relevant documentation
- Include code examples
- Add inline comments for complex logic
- Update API documentation if needed

## 🆘 Support

### **Getting Help**

#### **Documentation**
- **User Manual**: [docs/User_Training_Manual.md](docs/User_Training_Manual.md)
- **Technical Guide**: [docs/Developer_Technical_Guide.md](docs/Developer_Technical_Guide.md)
- **API Documentation**: [docs/API_Documentation.md](docs/API_Documentation.md)
- **Deployment Guide**: [docs/Deployment_Guide.md](docs/Deployment_Guide.md)

#### **Support Channels**
- **Email Support**: support@raghuuco.com
- **Phone Support**: +91-XXXXXXXXXX
- **Live Chat**: Available in the application
- **Support Tickets**: Create tickets within the application
- **Knowledge Base**: Searchable help documentation

#### **Community**
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/raghuuco/legal-practice-management/issues)
- **Discussions**: [Community discussions](https://github.com/raghuuco/legal-practice-management/discussions)
- **Wiki**: [Project wiki](https://github.com/raghuuco/legal-practice-management/wiki)

### **Troubleshooting**

#### **Common Issues**

**1. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U raghuuco_user -d raghuuco
```

**2. Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis

# Test Redis connection
redis-cli ping
```

**3. Port Conflicts**
```bash
# Check port usage
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Kill process using port
sudo kill -9 PID
```

**4. Docker Issues**
```bash
# Check Docker status
docker --version
docker-compose --version

# Clean up Docker
docker system prune -a
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **License Summary**
- **Commercial Use**: ✅ Allowed
- **Modification**: ✅ Allowed
- **Distribution**: ✅ Allowed
- **Private Use**: ✅ Allowed
- **Liability**: ❌ No liability
- **Warranty**: ❌ No warranty

### **Attribution**
- **Copyright**: © 2025 RAGHUU CO
- **License**: MIT License
- **Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 🙏 Acknowledgments

- **React Team**: For the amazing frontend framework
- **Node.js Community**: For the robust backend runtime
- **PostgreSQL Team**: For the reliable database system
- **Material-UI Team**: For the beautiful component library
- **Docker Team**: For the containerization platform
- **Open Source Community**: For all the amazing tools and libraries

## 📞 Contact

- **Website**: [https://raghuuco.com](https://raghuuco.com)
- **Email**: info@raghuuco.com
- **Phone**: +91-XXXXXXXXXX
- **Address**: RAGHUU CO, Legal Technology Solutions, India

---

**Made with ❤️ by the RAGHUU CO Development Team**