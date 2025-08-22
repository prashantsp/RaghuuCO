# Technical Specifications Document
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: August 22, 2025

---

## 1. UI/UX Requirements

### 1.1 Design System
- **Framework**: Material-UI (MUI) with custom theming
- **Data Grid**: ag-grid-community for responsive data tables
- **Mobile-First**: Responsive design with touch optimization
- **Cross-Platform**: Desktop, tablet, mobile support
- **Orientation**: Portrait and landscape mode support
- **Accessibility**: WCAG 2.1 compliance

### 1.2 ag-grid-community Configuration
```typescript
// Grid configuration for mobile responsiveness
const mobileGridConfig = {
  // Touch-friendly settings
  enableTouch: true,
  suppressTouch: false,
  
  // Mobile-optimized layout
  domLayout: 'autoHeight',
  suppressColumnVirtualisation: false,
  
  // Responsive column management
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 80,
    flex: 1,
  },
  
  // Mobile-specific features
  enableRangeSelection: true,
  enableFillHandle: true,
  rowSelection: 'multiple',
  
  // Performance optimization
  rowBuffer: 10,
  maxBlocksInCache: 10,
  cacheBlockSize: 100,
};
```

### 1.3 Security & Compliance Features
- **Session Timeout**: Configurable idle timeouts (default: 30 minutes)
- **Multi-Factor Authentication**: TOTP support
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: AES-256 for sensitive data
- **Access Control**: Role-based permissions
- **Compliance**: Indian legal industry standards

## 2. API Specifications

### 2.1 Authentication Endpoints

#### POST /api/v1/auth/login
**Description**: Local user authentication
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "partner"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### GET /api/v1/auth/google
**Description**: Initiate Google OAuth flow
**Response**: Redirects to Google OAuth

#### GET /api/v1/auth/google/callback
**Description**: Google OAuth callback
**Response**: Same as login endpoint

#### GET /api/v1/auth/linkedin
**Description**: Initiate LinkedIn OAuth flow

#### GET /api/v1/auth/microsoft
**Description**: Initiate Microsoft 365 OAuth flow

#### POST /api/v1/auth/refresh-session
**Description**: Refresh user session to prevent timeout
```json
{
  "refreshToken": "valid_refresh_token"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

#### POST /api/v1/auth/logout
**Description**: Logout user and invalidate session
```json
{
  "refreshToken": "valid_refresh_token"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### GET /api/v1/auth/session-status
**Description**: Check current session status and remaining time
**Response**:
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "remainingTime": 1800,
    "lastActivity": "2025-08-22T10:30:00Z",
    "timeoutWarning": false
  }
}
```

### 1.2 User Management Endpoints

#### GET /api/v1/users
**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `role`: string (filter by role)
- `search`: string (search by name/email)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "partner",
        "isActive": true,
        "lastLogin": "2025-08-22T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### POST /api/v1/users
**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "senior_associate",
  "phone": "+91-9876543210"
}
```

### 1.3 Case Management Endpoints

#### GET /api/v1/cases
**Query Parameters**:
- `page`: number
- `limit`: number
- `status`: string (active, pending, completed, on_hold)
- `caseType`: string (constitutional, real_estate, banking, company)
- `clientId`: string
- `search`: string

**Response**:
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "uuid",
        "caseNumber": "CASE-2025-001",
        "title": "Property Dispute Case",
        "caseType": "real_estate",
        "status": "active",
        "priority": "high",
        "client": {
          "id": "uuid",
          "name": "John Client"
        },
        "assignedPartner": {
          "id": "uuid",
          "name": "Raghuu Rao"
        },
        "startDate": "2025-01-15",
        "nextHearing": "2025-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### POST /api/v1/cases
**Request Body**:
```json
{
  "title": "New Case Title",
  "caseType": "constitutional",
  "description": "Case description",
  "clientId": "uuid",
  "assignedPartnerId": "uuid",
  "assignedAssociates": ["uuid1", "uuid2"],
  "caseValue": 1000000,
  "retainerAmount": 100000,
  "billingArrangement": "hourly",
  "startDate": "2025-08-22",
  "expectedCompletionDate": "2025-12-31",
  "courtDetails": {
    "courtName": "Karnataka High Court",
    "caseNumber": "WP-12345-2025"
  },
  "opposingParty": {
    "name": "Opposing Party Name",
    "contact": "contact@opposing.com"
  }
}
```

### 1.4 Document Management Endpoints

#### POST /api/v1/documents/upload
**Content-Type**: multipart/form-data
**Form Data**:
- `file`: File object
- `caseId`: string
- `documentType`: string
- `description`: string
- `tags`: string[] (optional)
- `isConfidential`: boolean (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "filename": "document.pdf",
      "originalFilename": "original_name.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "documentType": "pleading",
      "version": 1,
      "uploadedBy": "uuid",
      "createdAt": "2025-08-22T10:00:00Z"
    }
  }
}
```

#### GET /api/v1/documents/search
**Query Parameters**:
- `q`: string (search query)
- `caseId`: string (filter by case)
- `documentType`: string
- `tags`: string[]
- `dateFrom`: string (ISO date)
- `dateTo`: string (ISO date)

### 1.5 Billing Endpoints

#### POST /api/v1/time-entries
**Request Body**:
```json
{
  "caseId": "uuid",
  "taskDescription": "Client consultation meeting",
  "hoursWorked": 2.5,
  "billingRate": 5000,
  "isBillable": true,
  "dateWorked": "2025-08-22"
}
```

#### GET /api/v1/invoices
**Query Parameters**:
- `clientId`: string
- `status`: string (draft, sent, paid, overdue)
- `dateFrom`: string
- `dateTo`: string

### 1.6 Calendar Endpoints

#### GET /api/v1/calendar/events
**Query Parameters**:
- `startDate`: string (ISO date)
- `endDate`: string (ISO date)
- `eventType`: string
- `caseId`: string

**Response**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Court Hearing - Case 123",
        "description": "Hearing for property dispute case",
        "eventType": "court_hearing",
        "startDatetime": "2025-09-15T10:00:00Z",
        "endDatetime": "2025-09-15T11:00:00Z",
        "location": "Karnataka High Court, Court Room 5",
        "case": {
          "id": "uuid",
          "caseNumber": "CASE-2025-001"
        },
        "attendees": [
          {
            "id": "uuid",
            "name": "Raghuu Rao"
          }
        ]
      }
    ]
  }
}
```

## 2. Database Schema Details

### 2.1 Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for social-only users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### Social Accounts Table
```sql
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Indexes
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_provider ON social_accounts(provider);
```

#### Clients Table
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_type client_type_enum NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    pan_number VARCHAR(10),
    gstin VARCHAR(15),
    emergency_contact JSONB,
    referral_source VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_clients_active ON clients(is_active);
```

#### Cases Table
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    case_type case_type_enum NOT NULL,
    status case_status_enum DEFAULT 'active',
    priority priority_enum DEFAULT 'medium',
    description TEXT,
    client_id UUID NOT NULL REFERENCES clients(id),
    assigned_partner UUID REFERENCES users(id),
    assigned_associates UUID[] DEFAULT '{}',
    court_details JSONB,
    opposing_party JSONB,
    case_value DECIMAL(15,2),
    retainer_amount DECIMAL(15,2),
    billing_arrangement billing_type_enum,
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_cases_number ON cases(case_number);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_cases_partner ON cases(assigned_partner);
CREATE INDEX idx_cases_associates ON cases USING GIN(assigned_associates);
```

### 2.2 Audit and Compliance Tables

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### Conflict Checks Table
```sql
CREATE TABLE conflict_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    opposing_party_name VARCHAR(255),
    conflict_type VARCHAR(100),
    risk_level VARCHAR(50),
    mitigation_measures TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_conflict_checks_case_id ON conflict_checks(case_id);
CREATE INDEX idx_conflict_checks_client_id ON conflict_checks(client_id);
CREATE INDEX idx_conflict_checks_risk_level ON conflict_checks(risk_level);
```

## 3. Implementation Plan

### Phase 1: Foundation (Milestone 1)
**Objective**: Establish core infrastructure and authentication system

**Deliverables**:
1. **Project Setup**
   - Initialize Node.js/React project structure
   - Set up TypeScript configuration
   - Configure ESLint and Prettier
   - Set up Docker development environment

2. **Database Foundation**
   - Create PostgreSQL database
   - Implement database migration system
   - Create core tables (users, social_accounts, audit_logs)
   - Set up database connection pooling

3. **Authentication System**
   - Implement Passport.js with local strategy
   - Add Google OAuth 2.0 integration
   - Add LinkedIn OAuth 2.0 integration
   - Add Microsoft 365 OAuth 2.0 integration
   - Implement JWT token management
   - Create user registration and login flows

4. **Basic API Structure**
   - Set up Express.js server with middleware
   - Implement API routing structure
   - Add request validation with Joi
   - Implement error handling middleware
   - Set up CORS configuration

5. **Frontend Foundation**
   - Set up React with TypeScript
   - Configure Material-UI theme
   - Implement responsive layout system
   - Create authentication pages (login, register)
   - Set up React Router for navigation

**Success Criteria**:
- Users can register and login with email/password
- Users can authenticate with Google, LinkedIn, and Microsoft
- JWT tokens are properly generated and validated
- Database connections are stable and performant
- Frontend is responsive and mobile-friendly

### Phase 2: Core Features (Milestone 2)
**Objective**: Implement essential case and client management features

**Deliverables**:
1. **User Management**
   - User profile management
   - Role-based access control
   - User search and filtering
   - User activity tracking

2. **Client Management**
   - Client registration and profiles
   - Client search and filtering
   - Client case history
   - Conflict checking system

3. **Case Management**
   - Case creation and editing
   - Case status tracking
   - Case assignment to lawyers
   - Case timeline and milestones
   - Case search and filtering

4. **Document Management**
   - File upload system
   - Document versioning
   - Document categorization
   - Document search functionality
   - Document access control

5. **Mobile-First UI**
   - Responsive case dashboard
   - Mobile-optimized forms
   - Touch-friendly navigation
   - Offline capability setup

**Success Criteria**:
- Lawyers can create and manage cases
- Clients can be registered and linked to cases
- Documents can be uploaded and organized
- System is fully responsive on mobile devices
- Search functionality works across all entities

### Phase 3: Advanced Features (Milestone 3)
**Objective**: Implement billing, calendar, and reporting features

**Deliverables**:
1. **Time Tracking & Billing**
   - Time entry system
   - Billing rate management
   - Invoice generation
   - Payment tracking
   - Expense management

2. **Calendar & Scheduling**
   - Court date management
   - Appointment scheduling
   - Calendar integration (Google/Outlook)
   - Reminder system
   - Resource booking

3. **Communication System**
   - Internal messaging
   - Email integration
   - SMS notifications
   - Client portal messaging
   - Communication logging

4. **Reporting & Analytics**
   - Financial reports
   - Productivity reports
   - Case analytics
   - Client reports
   - Custom report builder

5. **Advanced Security**
   - Two-factor authentication
   - IP whitelisting
   - Document encryption
   - Advanced audit logging
   - Compliance reporting

**Success Criteria**:
- Complete billing workflow is functional
- Calendar integration works seamlessly
- Comprehensive reporting is available
- Security measures are implemented
- System meets compliance requirements

### Phase 4: Integration & Polish (Milestone 4)
**Objective**: Integrate external systems and optimize performance

**Deliverables**:
1. **External Integrations**
   - Payment gateway integration (Razorpay/PayU)
   - Email service integration (Gmail/Outlook)
   - Document signing integration (DocuSign/eSign)
   - SMS gateway integration (Twilio/TextLocal)
   - Accounting software integration

2. **Performance Optimization**
   - Database query optimization
   - Frontend performance tuning
   - Caching implementation
   - CDN setup
   - Load testing and optimization

3. **Advanced Features**
   - Full-text search across documents
   - Advanced filtering and sorting
   - Bulk operations
   - Data import/export
   - API rate limiting

4. **User Experience**
   - Advanced UI components
   - Keyboard shortcuts
   - Accessibility improvements
   - Progressive Web App features
   - Offline functionality

5. **Deployment & DevOps**
   - Production deployment setup
   - CI/CD pipeline
   - Monitoring and logging
   - Backup and recovery
   - Security hardening

**Success Criteria**:
- All external integrations are functional
- System performance meets requirements
- User experience is polished and intuitive
- Production deployment is stable
- System is ready for go-live

### Phase 5: Launch & Support (Milestone 5)
**Objective**: Launch the system and provide ongoing support

**Deliverables**:
1. **User Training**
   - Training materials and documentation
   - User onboarding process
   - Video tutorials
   - Help system implementation

2. **Go-Live Support**
   - Production monitoring
   - User support system
   - Bug fixes and hotfixes
   - Performance monitoring

3. **Post-Launch Optimization**
   - User feedback collection
   - Performance analysis
   - Feature enhancements
   - Security updates

4. **Maintenance Plan**
   - Regular security updates
   - Database maintenance
   - Backup verification
   - System health monitoring

**Success Criteria**:
- System is successfully launched
- Users are trained and productive
- Support system is operational
- Maintenance procedures are established
- System is stable and performing well

## 4. Technical Requirements

### 4.1 Development Environment
- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 14 or higher
- **Redis**: Version 7 or higher
- **Docker**: Version 20 or higher
- **Git**: Version 2.30 or higher

### 4.2 Production Environment
- **Cloud Platform**: AWS or Azure
- **Container Orchestration**: Docker Swarm or Kubernetes
- **Load Balancer**: Nginx or AWS ALB
- **CDN**: CloudFront or CloudFlare
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or CloudWatch

### 4.3 Security Requirements
- **SSL/TLS**: TLS 1.3 for all communications
- **Encryption**: AES-256 for data at rest
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Audit**: Comprehensive audit logging
- **Compliance**: Indian legal industry standards

### 4.4 Performance Requirements
- **Response Time**: < 200ms for API calls
- **Page Load**: < 3 seconds for initial load
- **Concurrent Users**: Support 1000+ users
- **Uptime**: 99.9% availability
- **Database**: < 100ms query response time

This technical specification provides a comprehensive roadmap for implementing the RAGHUU CO Legal Practice Management System with clear milestones, deliverables, and success criteria for each phase of development.