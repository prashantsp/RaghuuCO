# Database Entity Relationship Diagram (ERD)
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: August 22, 2025

---

## Database Overview

The RAGHUU CO Legal Practice Management System uses PostgreSQL 14+ with a comprehensive database design supporting user management, case management, document management, billing, content management, and security features.

---

## Complete Database Schema

### 1. User Management & Authentication

```sql
-- User roles enumeration
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'partner', 
    'senior_associate',
    'junior_associate',
    'paralegal',
    'client',
    'guest'
);

-- Client types enumeration
CREATE TYPE client_type_enum AS ENUM (
    'individual',
    'company'
);

-- Users table
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

-- Social login accounts
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'linkedin', 'microsoft'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);
```

### 2. Client Management

```sql
-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_type client_type_enum NOT NULL,
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

-- Client-user relationships (for client portal access)
CREATE TABLE client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- 'primary', 'secondary', 'authorized'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, user_id)
);
```

### 3. Case Management

```sql
-- Case types and status enumerations
CREATE TYPE case_type_enum AS ENUM (
    'constitutional',
    'real_estate',
    'banking',
    'company'
);

CREATE TYPE case_status_enum AS ENUM (
    'active',
    'pending',
    'completed',
    'on_hold'
);

CREATE TYPE priority_enum AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

CREATE TYPE billing_type_enum AS ENUM (
    'hourly',
    'fixed',
    'contingency'
);

-- Cases table
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

-- Case milestones and timeline
CREATE TABLE case_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'overdue'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Document Management

```sql
-- Document types enumeration
CREATE TYPE document_type_enum AS ENUM (
    'pleading',
    'contract',
    'evidence',
    'correspondence',
    'court_order',
    'research'
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type document_type_enum,
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    tags TEXT[],
    description TEXT,
    is_confidential BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document access permissions
CREATE TABLE document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    permission_type VARCHAR(50) NOT NULL, -- 'read', 'write', 'admin'
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(document_id, user_id)
);
```

### 5. Time Tracking & Billing

```sql
-- Time entries table
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

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue'
    due_date DATE,
    issued_date DATE,
    paid_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(4,2) NOT NULL,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    time_entry_id UUID REFERENCES time_entries(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id),
    description TEXT NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    is_billable BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Calendar & Scheduling

```sql
-- Event types enumeration
CREATE TYPE event_type_enum AS ENUM (
    'court_hearing',
    'client_meeting',
    'deadline',
    'reminder',
    'internal_meeting'
);

-- Calendar events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type_enum,
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
```

### 7. Content Management & Engagement

```sql
-- Content status enumerations
CREATE TYPE content_status_enum AS ENUM (
    'draft',
    'review',
    'published',
    'archived'
);

CREATE TYPE comment_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE newsletter_status_enum AS ENUM (
    'draft',
    'scheduled',
    'sent'
);

CREATE TYPE content_type_enum AS ENUM (
    'article',
    'newsletter'
);

CREATE TYPE analytics_action_enum AS ENUM (
    'view',
    'like',
    'share',
    'comment'
);

-- Content categories
CREATE TABLE content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES content_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category_id UUID REFERENCES content_categories(id),
    author_id UUID NOT NULL REFERENCES users(id),
    status content_status_enum DEFAULT 'draft',
    published_at TIMESTAMP,
    featured_image_url TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    seo_score INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article comments
CREATE TABLE article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL for anonymous comments
    guest_name VARCHAR(100), -- For anonymous comments
    guest_email VARCHAR(255), -- For anonymous comments
    content TEXT NOT NULL,
    status comment_status_enum DEFAULT 'pending',
    parent_comment_id UUID REFERENCES article_comments(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletters
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_id UUID,
    status newsletter_status_enum DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribe_date TIMESTAMP,
    source VARCHAR(100), -- 'website', 'client_portal', 'manual'
    preferences JSONB -- Newsletter preferences
);

-- Content analytics
CREATE TABLE content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL, -- Article or newsletter ID
    content_type content_type_enum NOT NULL,
    user_id UUID REFERENCES users(id),
    action analytics_action_enum NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Security & Compliance

```sql
-- Audit logs
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

-- Conflict checks
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

-- Data consents
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

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │ SOCIAL_ACCOUNTS │    │     CLIENTS     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───│ user_id (FK)    │    │ id (PK)         │
│ email           │    │ provider        │    │ client_type     │
│ password_hash   │    │ provider_user_id│    │ first_name      │
│ first_name      │    │ access_token    │    │ last_name       │
│ last_name       │    │ refresh_token   │    │ company_name    │
│ role            │    │ profile_data    │    │ email           │
│ phone           │    └─────────────────┘    │ phone           │
│ is_active       │                           │ address         │
│ email_verified  │                           │ pan_number      │
│ last_login      │                           │ gstin           │
│ created_at      │                           │ is_active       │
│ updated_at      │                           │ created_by (FK) │
└─────────────────┘                           │ created_at      │
         │                                     │ updated_at      │
         │                                     └─────────────────┘
         │                                             │
         │                                             │
         ▼                                             ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  CLIENT_USERS   │    │     CASES       │    │ CASE_MILESTONES │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ client_id (FK)  │    │ case_number     │    │ case_id (FK)    │
│ user_id (FK)    │    │ title           │    │ title           │
│ relationship_type│   │ case_type       │    │ description     │
│ is_active       │    │ status          │    │ milestone_date  │
│ created_at      │    │ priority        │    │ status          │
└─────────────────┘    │ description     │    │ created_by (FK) │
                       │ client_id (FK)  │    │ created_at      │
                       │ assigned_partner│    └─────────────────┘
                       │ assigned_associates│
                       │ court_details   │
                       │ opposing_party  │
                       │ case_value      │
                       │ retainer_amount │
                       │ billing_arrangement│
                       │ start_date      │
                       │ expected_completion_date│
                       │ actual_completion_date│
                       │ created_by (FK) │
                       │ created_at      │
                       │ updated_at      │
                       └─────────────────┘
                                │
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DOCUMENTS     │    │ TIME_ENTRIES    │    │   INVOICES      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ case_id (FK)    │    │ case_id (FK)    │    │ case_id (FK)    │
│ filename        │    │ user_id (FK)    │    │ invoice_number  │
│ original_filename│   │ task_description│    │ client_id (FK)  │
│ file_path       │    │ hours_worked    │    │ total_amount    │
│ file_size       │    │ billing_rate    │    │ tax_amount      │
│ mime_type       │    │ is_billable     │    │ status          │
│ document_type   │    │ date_worked     │    │ due_date        │
│ version         │    │ created_at      │    │ issued_date     │
│ parent_document_id│  └─────────────────┘    │ paid_date       │
│ tags            │                           │ created_by (FK) │
│ description     │                           └─────────────────┘
│ is_confidential │                           │
│ uploaded_by (FK)│                           │
│ created_at      │                           │
└─────────────────┘                           │
         │                                              │
         │                                              ▼
         ▼                                     ┌─────────────────┐
┌─────────────────┐                            │ INVOICE_ITEMS   │
│DOCUMENT_PERMISSIONS│                         ├─────────────────┤
├─────────────────┤                            │ id (PK)         │
│ id (PK)         │                            │ invoice_id (FK) │
│ document_id (FK)│                            │ description     │
│ user_id (FK)    │                            │ quantity        │
│ permission_type │                            │ unit_price      │
│ granted_by (FK) │                            │ total_price     │
│ granted_at      │                            │ time_entry_id (FK)│
│ expires_at      │                            │ created_at      │
└─────────────────┘                            └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ CALENDAR_EVENTS │    │   EXPENSES      │    │CONTENT_CATEGORIES│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ title           │    │ case_id (FK)    │    │ name            │
│ description     │    │ description     │    │ slug            │
│ event_type      │    │ amount          │    │ description     │
│ case_id (FK)    │    │ expense_date    │    │ parent_category_id│
│ start_datetime  │    │ receipt_url     │    │ is_active       │
│ end_datetime    │    │ is_billable     │    │ created_at      │
│ location        │    │ created_by (FK) │    └─────────────────┘
│ attendees       │    │ created_at      │             │
│ is_all_day      │    └─────────────────┘             │
│ reminder_intervals│                                  │
│ google_calendar_id│                                  │
│ created_by (FK) │                                   │
│ created_at      │                                   │
└─────────────────┘                                   │
                                                      │
                                                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    ARTICLES     │    │ARTICLE_COMMENTS │    │   NEWSLETTERS   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ title           │    │ article_id (FK) │    │ title           │
│ slug            │    │ user_id (FK)    │    │ subject         │
│ excerpt         │    │ guest_name      │    │ content         │
│ content         │    │ guest_email     │    │ template_id     │
│ category_id (FK)│    │ status          │    │ status          │
│ author_id (FK)  │    │ parent_comment_id│   │ scheduled_at    │
│ status          │    │ is_public       │    │ sent_at         │
│ published_at    │    │ created_at      │    │ recipient_count │
│ featured_image_url│  │ open_count      │    │ click_count     │
│ meta_title      │    └─────────────────┘    │ created_by (FK) │
│ meta_description│                            │ created_at      │
│ meta_keywords   │                            └─────────────────┘
│ seo_score       │                                    │
│ view_count      │                                    │
│ is_featured     │                                    │
│ is_public       │                                    │
│ created_at      │                                    │
│ updated_at      │                                    │
└─────────────────┘                                    │
         │                                              │
         │                                              ▼
         ▼                                     ┌─────────────────┐
┌─────────────────┐                            │NEWSLETTER_SUBSCRIBERS│
│CONTENT_ANALYTICS│                            ├─────────────────┤
├─────────────────┤                            │ id (PK)         │
│ id (PK)         │                            │ email           │
│ content_id      │                            │ first_name      │
│ content_type    │                            │ last_name       │
│ user_id (FK)    │                            │ is_active       │
│ action          │                            │ subscription_date│
│ ip_address      │                            │ unsubscribe_date│
│ user_agent      │                            │ source          │
│ referrer        │                            │ preferences     │
│ created_at      │                            └─────────────────┘
└─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AUDIT_LOGS    │    │ CONFLICT_CHECKS │    │  DATA_CONSENTS  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ user_id (FK)    │    │ case_id (FK)    │    │ user_id (FK)    │
│ action          │    │ client_id (FK)  │    │ consent_type    │
│ resource_type   │    │ opposing_party_name│ │ consent_given   │
│ resource_id     │    │ conflict_type   │    │ consent_date    │
│ old_values      │    │ risk_level      │    │ withdrawal_date │
│ new_values      │    │ mitigation_measures│ │ ip_address      │
│ ip_address      │    │ checked_by (FK) │    │ user_agent      │
│ user_agent      │    │ checked_at      │    └─────────────────┘
│ session_id      │    └─────────────────┘
│ created_at      │
└─────────────────┘

┌─────────────────┐
│ USER_SESSIONS   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ session_token   │
│ refresh_token   │
│ ip_address      │
│ user_agent      │
│ is_active       │
│ expires_at      │
│ created_at      │
└─────────────────┘
```

---

## Key Relationships

### 1. **User Management**
- `users` ↔ `social_accounts` (1:Many)
- `users` ↔ `client_users` (Many:Many through junction table)
- `users` ↔ `user_sessions` (1:Many)

### 2. **Case Management**
- `clients` ↔ `cases` (1:Many)
- `users` ↔ `cases` (Many:Many through assigned_partner and assigned_associates)
- `cases` ↔ `case_milestones` (1:Many)

### 3. **Document Management**
- `cases` ↔ `documents` (1:Many)
- `documents` ↔ `document_permissions` (1:Many)
- `documents` ↔ `documents` (Self-referencing for versioning)

### 4. **Billing & Time Tracking**
- `cases` ↔ `time_entries` (1:Many)
- `cases` ↔ `invoices` (1:Many)
- `invoices` ↔ `invoice_items` (1:Many)
- `cases` ↔ `expenses` (1:Many)

### 5. **Content Management**
- `content_categories` ↔ `articles` (1:Many)
- `articles` ↔ `article_comments` (1:Many)
- `users` ↔ `articles` (1:Many as authors)
- `newsletters` ↔ `newsletter_subscribers` (Many:Many through analytics)

### 6. **Security & Compliance**
- `users` ↔ `audit_logs` (1:Many)
- `cases` ↔ `conflict_checks` (1:Many)
- `users` ↔ `data_consents` (1:Many)

---

## Indexes for Performance

### Primary Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Cases
CREATE INDEX idx_cases_number ON cases(case_number);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_cases_partner ON cases(assigned_partner);
CREATE INDEX idx_cases_associates ON cases USING GIN(assigned_associates);

-- Documents
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Content
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);

-- Analytics
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Sessions
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

---

## Data Types Summary

### **Core Entities**: 8 tables
- User Management (2 tables)
- Client Management (2 tables)
- Case Management (2 tables)

### **Document Management**: 2 tables
- Documents and permissions

### **Billing & Time**: 4 tables
- Time entries, invoices, invoice items, expenses

### **Calendar**: 1 table
- Calendar events

### **Content Management**: 6 tables
- Categories, articles, comments, newsletters, subscribers, analytics

### **Security & Compliance**: 4 tables
- Audit logs, conflict checks, data consents, user sessions

### **Total Tables**: 25 tables

This comprehensive database design supports all the features of the RAGHUU CO Legal Practice Management System with proper relationships, indexing, and data integrity constraints.