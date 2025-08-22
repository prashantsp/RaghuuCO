# System Design & Architecture Document
## RAGHUU CO Legal Practice Management System

### Document Version: 2.0
### Date: August 22, 2025
### Technology Stack: Node.js/React/PostgreSQL (Raw SQL)

---

## Architecture Overview

The RAGHUU CO Legal Practice Management System follows a modern three-tier architecture built on the PERN stack (PostgreSQL, Express.js, React, Node.js) with a microservices-oriented approach for scalability and maintainability. The system uses raw SQL for database operations to ensure maximum control and performance.

### Architecture Principles
1. **Separation of Concerns**: Clear separation between presentation, business logic, and data layers
2. **Scalability**: Horizontal scaling capabilities with containerized deployment
3. **Security-First**: End-to-end encryption and role-based access control
4. **API-First**: RESTful APIs for all operations with potential GraphQL implementation
5. **Mobile-First**: Progressive Web App (PWA) with responsive design
6. **Compliance-Ready**: Built-in audit trails and Indian legal compliance features
7. **Raw SQL Approach**: Direct database control for optimal performance and flexibility

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Client Layer (React PWA - Mobile First)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                     API Gateway (Express.js)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application Services Layer (Node.js Microservices)                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │   Auth          │ │  Case Mgmt      │ │  Document       │               │
│  │   Service       │ │   Service       │ │   Service       │               │
│  │                 │ │                 │ │                 │               │
│  │ • Social Login  │ │ • Case CRUD     │ │ • File Upload   │               │
│  │ • JWT Auth      │ │ • Workflows     │ │ • Version Ctrl  │               │
│  │ • RBAC          │ │ • Timeline      │ │ • OCR           │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │   Billing       │ │   Calendar      │ │  Notification   │               │
│  │   Service       │ │   Service       │ │   Service       │               │
│  │                 │ │                 │ │                 │               │
│  │ • Time Tracking │ │ • Court Dates   │ │ • Email         │               │
│  │ • Invoicing     │ │ • Scheduling    │ │ • SMS           │               │
│  │ • Payments      │ │ • Integration   │ │ • Push          │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│                    Data Access Layer (Raw SQL)                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │   Query         │ │   Transaction   │ │   Connection    │               │
│  │   Builder       │ │   Manager       │ │   Pool          │               │
│  │                 │ │                 │ │                 │               │
│  │ • Parameterized │ │ • ACID          │ │ • PgBouncer     │               │
│  │ • SQL Injection │ │ • Rollback      │ │ • Health Checks │               │
│  │ • Prevention    │ │ • Isolation     │ │ • Load Balance  │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│                   Database Layer (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Selection

### Frontend Stack
**React 18 with TypeScript**
- **Why React**: Component reusability, large ecosystem, excellent development tools
- **Why TypeScript**: Type safety, better IDE support, reduced runtime errors
- **State Management**: Redux Toolkit for complex state, React Query for server state
- **UI Framework**: Material-UI (MUI) for consistent design system
- **Data Grid**: ag-grid-community for responsive, mobile-optimized data tables
- **Routing**: React Router v6 for client-side routing
- **Forms**: React Hook Form with Yup validation
- **PWA**: Service workers for offline capabilities
- **Mobile-First**: Responsive design with touch-optimized interfaces
- **Theme**: Custom Material-UI theme with modern, sleek design

### Backend Stack
**Node.js with Express.js and TypeScript**
- **Why Node.js**: JavaScript ecosystem consistency, excellent I/O performance
- **Why Express.js**: Mature framework, extensive middleware ecosystem
- **API Architecture**: RESTful APIs with OpenAPI 3.0 documentation
- **Database**: Raw SQL with pg library for direct database control
- **Authentication**: Passport.js with JWT, supporting Google, LinkedIn, Microsoft 365
- **File Upload**: Multer with AWS S3 or local storage options
- **Task Queue**: Bull Queue with Redis for background processing

### Database Design
**PostgreSQL 14+ with JSON support**
- **Why PostgreSQL**: ACID compliance, JSON support, excellent performance
- **Raw SQL Approach**: Direct control over queries for optimization
- **Connection Pooling**: PgBouncer for connection management
- **Backup Strategy**: Daily automated backups with point-in-time recovery
- **Indexing Strategy**: B-tree indexes for queries, GIN indexes for JSON fields

### Infrastructure & DevOps
- **Containerization**: Docker and Docker Compose
- **Deployment**: AWS/Azure with container orchestration
- **Load Balancing**: Nginx reverse proxy
- **SSL/TLS**: Let's Encrypt certificates with auto-renewal
- **Monitoring**: Prometheus + Grafana for metrics, Winston for logging
- **CI/CD**: GitHub Actions with automated testing and deployment

## Database Design

### Core Entity Relationships

```sql
-- Enhanced users table with social login support
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

-- Social login accounts linking
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'linkedin', 'microsoft'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    profile_data JSONB, -- Store provider-specific profile data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Clients with comprehensive contact information
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_type client_type_enum NOT NULL, -- individual, company
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB, -- Flexible address structure
    pan_number VARCHAR(10),
    gstin VARCHAR(15),
    emergency_contact JSONB,
    referral_source VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cases/Matters management
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    case_type case_type_enum NOT NULL, -- constitutional, real_estate, banking, company
    status case_status_enum DEFAULT 'active', -- active, pending, completed, on_hold
    priority priority_enum DEFAULT 'medium', -- low, medium, high, urgent
    description TEXT,
    client_id UUID NOT NULL REFERENCES clients(id),
    assigned_partner UUID REFERENCES users(id),
    assigned_associates UUID[] DEFAULT '{}',
    court_details JSONB,
    opposing_party JSONB,
    case_value DECIMAL(15,2),
    retainer_amount DECIMAL(15,2),
    billing_arrangement billing_type_enum, -- hourly, fixed, contingency
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document management with version control
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type document_type_enum, -- pleading, contract, evidence, correspondence
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    tags TEXT[],
    description TEXT,
    is_confidential BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time tracking for billing
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    user_id UUID NOT NULL REFERENCES users(id),
    task_description TEXT NOT NULL,
    hours_worked DECIMAL(4,2) NOT NULL,
    billing_rate DECIMAL(8,2),
    is_billable BOOLEAN DEFAULT true,
    date_worked DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar and scheduling
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type_enum, -- court_hearing, client_meeting, deadline, reminder
    case_id UUID REFERENCES cases(id),
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(255),
    attendees UUID[] DEFAULT '{}',
    is_all_day BOOLEAN DEFAULT false,
    reminder_intervals INTEGER[] DEFAULT '{1440, 60}', -- minutes before event
    google_calendar_id VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comprehensive audit logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'view'
    resource_type VARCHAR(100) NOT NULL, -- 'case', 'client', 'document'
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conflict of interest tracking
CREATE TABLE conflict_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    opposing_party_name VARCHAR(255),
    conflict_type VARCHAR(100), -- 'direct', 'indirect', 'potential'
    risk_level VARCHAR(50), -- 'low', 'medium', 'high'
    mitigation_measures TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data protection compliance
CREATE TABLE data_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    consent_type VARCHAR(100) NOT NULL, -- 'data_processing', 'marketing', 'third_party'
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP NOT NULL,
    withdrawal_date TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);
```

### Key Database Features
1. **UUID Primary Keys**: For better security and distributed system compatibility
2. **JSONB Fields**: For flexible schema design (addresses, court details, metadata)
3. **Array Fields**: For multi-value relationships (assigned associates, tags, attendees)
4. **Enum Types**: For controlled vocabulary and data integrity
5. **Audit Trails**: Comprehensive created_at/updated_at timestamps with user tracking
6. **Soft Deletes**: is_active flags instead of hard deletes for compliance
7. **Social Login Support**: Dedicated table for OAuth provider accounts
8. **Compliance Features**: Audit logs, conflict checks, data consents

## Raw SQL Implementation

### Database Service Layer
```typescript
// Database service with raw SQL
class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User management queries
  async getUserByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT id, email, password_hash, first_name, last_name, role, is_active, email_verified
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    const users = await this.query(sql, [email]);
    return users[0] || null;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role, is_active, created_at
    `;
    const users = await this.query(sql, [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.role,
      userData.phone
    ]);
    return users[0];
  }

  // Social login queries
  async linkSocialAccount(userId: string, provider: string, providerUserId: string, profileData: any): Promise<void> {
    const sql = `
      INSERT INTO social_accounts (user_id, provider, provider_user_id, profile_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (provider, provider_user_id) 
      DO UPDATE SET 
        user_id = $1,
        profile_data = $4,
        updated_at = CURRENT_TIMESTAMP
    `;
    await this.query(sql, [userId, provider, providerUserId, JSON.stringify(profileData)]);
  }

  async findUserBySocialAccount(provider: string, providerUserId: string): Promise<User | null> {
    const sql = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active
      FROM users u
      JOIN social_accounts sa ON u.id = sa.user_id
      WHERE sa.provider = $1 AND sa.provider_user_id = $2 AND u.is_active = true
    `;
    const users = await this.query(sql, [provider, providerUserId]);
    return users[0] || null;
  }

  // Case management queries
  async getCasesByUser(userId: string, role: string): Promise<Case[]> {
    let sql: string;
    let params: any[];

    if (role === 'client') {
      sql = `
        SELECT c.*, cl.first_name as client_first_name, cl.last_name as client_last_name
        FROM cases c
        JOIN clients cl ON c.client_id = cl.id
        WHERE cl.id IN (SELECT client_id FROM client_users WHERE user_id = $1)
        AND c.is_active = true
        ORDER BY c.updated_at DESC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT c.*, cl.first_name as client_first_name, cl.last_name as client_last_name
        FROM cases c
        JOIN clients cl ON c.client_id = cl.id
        WHERE c.assigned_partner = $1 
           OR $1 = ANY(c.assigned_associates)
           OR $2 IN ('super_admin', 'partner')
        AND c.is_active = true
        ORDER BY c.updated_at DESC
      `;
      params = [userId, role];
    }

    return await this.query(sql, params);
  }

  // Audit logging
  async logAuditEvent(auditData: AuditLogData): Promise<void> {
    const sql = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    await this.query(sql, [
      auditData.userId,
      auditData.action,
      auditData.resourceType,
      auditData.resourceId,
      auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
      auditData.newValues ? JSON.stringify(auditData.newValues) : null,
      auditData.ipAddress,
      auditData.userAgent,
      auditData.sessionId
    ]);
  }
}
```

## API Design

### RESTful API Structure

```
/api/v1/
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   ├── POST /forgot-password
│   ├── GET /google
│   ├── GET /google/callback
│   ├── GET /linkedin
│   ├── GET /linkedin/callback
│   ├── GET /microsoft
│   └── GET /microsoft/callback
├── /users
│   ├── GET /users (with pagination, filtering)
│   ├── POST /users
│   ├── GET /users/:id
│   ├── PUT /users/:id
│   ├── DELETE /users/:id
│   └── GET /users/:id/profile
├── /clients
│   ├── GET /clients
│   ├── POST /clients
│   ├── GET /clients/:id
│   ├── PUT /clients/:id
│   ├── GET /clients/:id/cases
│   └── POST /clients/:id/conflict-check
├── /cases
│   ├── GET /cases
│   ├── POST /cases
│   ├── GET /cases/:id
│   ├── PUT /cases/:id
│   ├── GET /cases/:id/documents
│   ├── GET /cases/:id/time-entries
│   ├── GET /cases/:id/timeline
│   └── POST /cases/:id/assign
├── /documents
│   ├── POST /documents/upload
│   ├── GET /documents/:id
│   ├── GET /documents/:id/download
│   ├── PUT /documents/:id
│   ├── DELETE /documents/:id
│   └── GET /documents/search
├── /calendar
│   ├── GET /events
│   ├── POST /events
│   ├── GET /events/:id
│   ├── PUT /events/:id
│   ├── DELETE /events/:id
│   └── GET /events/upcoming
├── /billing
│   ├── GET /time-entries
│   ├── POST /time-entries
│   ├── GET /invoices
│   ├── POST /invoices
│   ├── GET /invoices/:id
│   └── POST /invoices/:id/pay
└── /reports
    ├── GET /reports/financial
    ├── GET /reports/productivity
    ├── GET /reports/case-analytics
    └── GET /reports/audit-logs
```

### API Security Features
1. **JWT Authentication**: Stateless authentication with access and refresh tokens
2. **Rate Limiting**: Express-rate-limit for API protection
3. **Input Validation**: Joi/Yup validation for all request parameters
4. **SQL Injection Prevention**: Parameterized queries through raw SQL
5. **CORS Configuration**: Properly configured cross-origin resource sharing
6. **API Versioning**: Version-based routing for backward compatibility
7. **Social Login Security**: OAuth 2.0 with state parameter validation

## Security Architecture

### Session Management & Timeout
```typescript
// Session timeout configuration
interface SessionConfig {
  idleTimeout: number; // 30 minutes default
  absoluteTimeout: number; // 8 hours maximum
  warningTime: number; // 5 minutes before timeout
  refreshTokenExpiry: number; // 7 days
}

// Session monitoring
class SessionManager {
  private idleTimer: NodeJS.Timeout;
  private warningTimer: NodeJS.Timeout;
  
  startIdleMonitoring(userId: string) {
    this.idleTimer = setTimeout(() => {
      this.showTimeoutWarning();
    }, SESSION_CONFIG.warningTime);
  }
  
  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    this.startIdleMonitoring();
  }
  
  private showTimeoutWarning() {
    // Show warning modal to user
    // Auto-logout after warning period
  }
}
```

### Authentication & Authorization
```typescript
// Passport.js configuration for all providers
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';

// Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const db = new DatabaseService();
    let user = await db.findUserBySocialAccount('google', profile.id);
    
    if (!user) {
      // Create new user from Google profile
      const userData = {
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        role: 'client' // Default role, can be changed by admin
      };
      user = await db.createUser(userData);
      await db.linkSocialAccount(user.id, 'google', profile.id, profile);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// LinkedIn OAuth 2.0
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
  // Similar implementation for LinkedIn
}));

// Microsoft 365 OAuth 2.0
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: "/auth/microsoft/callback",
  scope: ['user.read', 'email', 'profile']
}, async (accessToken, refreshToken, profile, done) => {
  // Similar implementation for Microsoft
}));

// JWT token structure
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// Role-based permissions
const PERMISSIONS = {
  CASE_READ: 'case:read',
  CASE_WRITE: 'case:write',
  CLIENT_READ: 'client:read',
  CLIENT_WRITE: 'client:write',
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
  ADMIN_ACCESS: 'admin:access',
  AUDIT_ACCESS: 'audit:access'
};

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  PARTNER: [PERMISSIONS.CASE_READ, PERMISSIONS.CASE_WRITE, PERMISSIONS.CLIENT_READ, PERMISSIONS.CLIENT_WRITE, PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_WRITE],
  SENIOR_ASSOCIATE: [PERMISSIONS.CASE_READ, PERMISSIONS.CASE_WRITE, PERMISSIONS.CLIENT_READ],
  JUNIOR_ASSOCIATE: [PERMISSIONS.CASE_READ, PERMISSIONS.CLIENT_READ],
  CLIENT: [PERMISSIONS.CASE_READ] // Only own cases
};
```

### Data Encryption
1. **At Rest**: AES-256 encryption for sensitive database fields
2. **In Transit**: TLS 1.3 for all API communications
3. **Document Storage**: Encrypted file storage with access-controlled URLs
4. **Password Security**: bcrypt with salt rounds for password hashing

## Frontend Architecture (Mobile-First)

### UI/UX Design Principles
- **Clean & Modern**: Minimalist design with clear visual hierarchy
- **Sleek Interface**: Smooth animations and transitions
- **Mobile-First**: Touch-optimized interactions and responsive layouts
- **Accessibility**: WCAG 2.1 compliance for all users
- **Cross-Platform**: Consistent experience across desktop, tablet, and mobile
- **Orientation Support**: Seamless switching between portrait and landscape

### Data Grid Implementation (ag-grid-community)
```typescript
// ag-grid configuration for responsive design
const gridOptions: GridOptions = {
  // Mobile-optimized settings
  domLayout: 'autoHeight',
  suppressColumnVirtualisation: false,
  suppressRowVirtualisation: false,
  
  // Touch-friendly interactions
  enableRangeSelection: true,
  enableFillHandle: true,
  enableRangeHandle: true,
  
  // Responsive column definitions
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
    flex: 1,
  },
  
  // Mobile-specific configurations
  columnDefs: [
    {
      field: 'caseNumber',
      headerName: 'Case #',
      width: 120,
      pinned: 'left',
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      field: 'title',
      headerName: 'Case Title',
      flex: 2,
      cellRenderer: 'agCellRenderer',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      cellRenderer: 'statusRenderer',
    },
    {
      field: 'clientName',
      headerName: 'Client',
      flex: 1,
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
    },
    {
      field: 'nextHearing',
      headerName: 'Next Hearing',
      width: 130,
      cellRenderer: 'dateRenderer',
    }
  ],
  
  // Mobile-responsive features
  onGridReady: (params) => {
    params.api.sizeColumnsToFit();
  },
  
  // Touch gesture support
  enableTouch: true,
  suppressTouch: false,
  
  // Performance optimization
  rowBuffer: 10,
  maxBlocksInCache: 10,
  cacheBlockSize: 100,
};

// Responsive grid wrapper component
const ResponsiveDataGrid: React.FC<GridProps> = ({ data, ...props }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={`data-grid-container ${isMobile ? 'mobile' : 'desktop'}`}>
      <AgGridReact
        {...gridOptions}
        {...props}
        data={data}
        className={isMobile ? 'ag-theme-material-mobile' : 'ag-theme-material'}
      />
    </div>
  );
};
```

### Component Structure
```
src/
├── components/
│   ├── ui/ (Reusable UI components)
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   ├── forms/ (Form components)
│   │   ├── LoginForm/
│   │   ├── CaseForm/
│   │   └── ClientForm/
│   ├── layout/ (Layout components)
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MobileNav/
│   └── feature/ (Feature-specific components)
│       ├── cases/
│       ├── clients/
│       ├── documents/
│       └── billing/
├── pages/ (Route components)
├── hooks/ (Custom React hooks)
├── services/ (API service functions)
├── store/ (Redux store configuration)
├── utils/ (Utility functions)
├── types/ (TypeScript type definitions)
├── constants/ (Application constants)
└── styles/ (Global styles and themes)
```

### Mobile-First Design System
```typescript
// Responsive breakpoints
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};

// Mobile-first CSS approach
export const mobileFirst = {
  container: `
    padding: 1rem;
    max-width: 100%;
    
    @media (min-width: ${breakpoints.tablet}) {
      padding: 2rem;
      max-width: 750px;
    }
    
    @media (min-width: ${breakpoints.desktop}) {
      padding: 3rem;
      max-width: 1200px;
    }
  `,
  
  grid: `
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    @media (min-width: ${breakpoints.tablet}) {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    @media (min-width: ${breakpoints.desktop}) {
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
  `
};

// Touch-friendly components
export const touchTarget = {
  minHeight: '44px',
  minWidth: '44px',
  padding: '12px 16px',
  borderRadius: '8px'
};
```

### Progressive Web App Features
```typescript
// Service Worker for offline functionality
// public/sw.js
const CACHE_NAME = 'raghuu-legal-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Web App Manifest
// public/manifest.json
{
  "name": "RaghuuCO Legal Practice Management",
  "short_name": "RaghuuCO",
  "description": "Legal practice management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Scalability Considerations

### Horizontal Scaling
1. **Stateless Services**: All services designed to be stateless
2. **Load Balancing**: Nginx load balancer with health checks
3. **Database Scaling**: Read replicas for query distribution
4. **Caching Layer**: Redis for session storage and caching
5. **CDN Integration**: CloudFront/CloudFlare for static asset delivery

### Performance Metrics
- **Response Time**: < 200ms for API calls, < 3s for page loads
- **Throughput**: Support 1000+ concurrent users
- **Database**: < 100ms query response time
- **Availability**: 99.9% uptime SLA

## Integration Architecture

### External System Integrations
```typescript
// Payment gateway integration
interface PaymentGateway {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerification>;
}

// Email service integration
interface EmailService {
  sendEmail(to: string, template: string, data: any): Promise<void>;
  sendBulkEmail(recipients: string[], template: string, data: any): Promise<void>;
}

// Calendar integration
interface CalendarService {
  createEvent(event: CalendarEvent): Promise<string>;
  updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>;
  syncEvents(): Promise<CalendarEvent[]>;
}

// SMS service integration
interface SMSService {
  sendSMS(to: string, message: string): Promise<void>;
  sendBulkSMS(recipients: string[], message: string): Promise<void>;
}
```

### Integration Patterns
1. **API-First Approach**: All integrations through well-defined APIs
2. **Webhook Support**: Real-time notifications for external systems
3. **Retry Mechanisms**: Exponential backoff for failed requests
4. **Circuit Breakers**: Fail-fast pattern for external service failures

## Deployment Architecture

### Container Strategy
```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID}
      - LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET}
      - MICROSOFT_CLIENT_ID=${MICROSOFT_CLIENT_ID}
      - MICROSOFT_CLIENT_SECRET=${MICROSOFT_CLIENT_SECRET}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=raghuu_legal
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

## Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging with Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Checks
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      externalAPIs: await checkExternalAPIs()
    }
  };
  
  const status = health.checks.database && health.checks.redis ? 200 : 503;
  res.status(status).json(health);
});
```

This architecture provides a robust, scalable, and secure foundation for the RAGHUU CO Legal Practice Management System, ensuring high performance, maintainability, and compliance with Indian legal industry requirements while supporting all social login providers and mobile-first design principles.