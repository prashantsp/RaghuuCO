# API Documentation
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: August 24, 2025
### Base URL: `https://api.raghuuco.com/v1`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Cases](#case-endpoints)
  - [Documents](#document-endpoints)
  - [Clients](#client-endpoints)
  - [Billing](#billing-endpoints)
  - [Calendar](#calendar-endpoints)
  - [Reports](#report-endpoints)
  - [Support](#support-endpoints)
  - [Feedback](#feedback-endpoints)
  - [Training](#training-endpoints)
  - [Knowledge Base](#knowledge-base-endpoints)
- [WebSocket Events](#websocket-events)
- [SDK Examples](#sdk-examples)

---

## 🎯 Overview

The RAGHUU CO API provides comprehensive access to all system functionality through RESTful endpoints. The API is designed to be secure, scalable, and easy to integrate with any application.

### **Key Features:**
- **RESTful Design**: Standard HTTP methods and status codes
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Built-in rate limiting for API protection
- **Real-time Updates**: WebSocket support for live updates
- **Comprehensive Error Handling**: Detailed error messages and codes
- **Pagination**: Standardized pagination for large datasets
- **Filtering & Sorting**: Advanced query capabilities
- **File Upload**: Secure file upload and management
- **Webhook Support**: Event-driven integrations

### **API Versioning:**
- **Current Version**: v1
- **Version Header**: `Accept: application/vnd.raghuuco.v1+json`
- **Deprecation Policy**: 12-month notice for breaking changes

---

## 🔐 Authentication

### **Authentication Methods**

#### **1. JWT Token Authentication**
```http
Authorization: Bearer <jwt_token>
```

#### **2. API Key Authentication (for integrations)**
```http
X-API-Key: <api_key>
```

### **Token Management**

#### **Login to Get Token**
```bash
curl -X POST https://api.raghuuco.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### **Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "attorney"
    }
  }
}
```

#### **Refresh Token**
```bash
curl -X POST https://api.raghuuco.com/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## ⚠️ Error Handling

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2025-08-24T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### **Common Error Codes**

| **Code** | **HTTP Status** | **Description** |
|----------|-----------------|-----------------|
| `AUTHENTICATION_FAILED` | 401 | Invalid or expired token |
| `AUTHORIZATION_FAILED` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### **Validation Errors**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## 🚦 Rate Limiting

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642233600
```

### **Rate Limits by Endpoint**

| **Endpoint Category** | **Requests per Hour** | **Burst Limit** |
|----------------------|----------------------|-----------------|
| Authentication | 100 | 10 |
| Read Operations | 1000 | 100 |
| Write Operations | 500 | 50 |
| File Uploads | 100 | 10 |
| Reports | 100 | 10 |

### **Rate Limit Exceeded Response**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "retryAfter": 3600
  }
}
```

---

## 🔗 Endpoints

### **Authentication Endpoints**

#### **POST /auth/login**
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "attorney",
      "permissions": ["cases:read", "cases:write"]
    }
  }
}
```

#### **POST /auth/refresh**
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **POST /auth/logout**
Logout user and invalidate tokens.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /auth/forgot-password**
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### **POST /auth/reset-password**
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_123",
  "password": "new_password123"
}
```

#### **POST /auth/change-password**
Change user password.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "old_password123",
  "newPassword": "new_password123"
}
```

---

### **User Endpoints**

#### **GET /users/profile**
Get current user profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "attorney",
    "avatar": "https://api.raghuuco.com/avatars/user_123.jpg",
    "phone": "+91-9876543210",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    },
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kolkata",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-08-24T10:30:00Z"
  }
}
```

#### **PUT /users/profile**
Update user profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "preferences": {
    "language": "en",
    "timezone": "Asia/Kolkata"
  }
}
```

#### **GET /users**
Get all users (admin only).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by name or email
- `role` (string): Filter by role
- `status` (string): Filter by status (active, inactive)
- `sortBy` (string): Sort field (name, email, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "attorney",
        "status": "active",
        "createdAt": "2025-01-01T00:00:00Z"
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

#### **POST /users**
Create new user (admin only).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "role": "paralegal",
  "phone": "+91-9876543210",
  "password": "password123"
}
```

#### **GET /users/{userId}**
Get user by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /users/{userId}**
Update user by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **DELETE /users/{userId}**
Delete user by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Case Endpoints**

#### **GET /cases**
Get all cases.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by title or case number
- `status` (string): Filter by status (open, closed, pending)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `clientId` (string): Filter by client ID
- `assignedTo` (string): Filter by assigned user ID
- `dateFrom` (string): Filter by start date (ISO 8601)
- `dateTo` (string): Filter by end date (ISO 8601)
- `sortBy` (string): Sort field (title, createdAt, updatedAt, priority)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "case_123",
        "caseNumber": "CASE-2025-001",
        "title": "Contract Dispute",
        "description": "Contract dispute between parties",
        "status": "open",
        "priority": "high",
        "clientId": "client_123",
        "assignedTo": "user_123",
        "estimatedHours": 40,
        "actualHours": 25,
        "billingRate": 500,
        "totalBilled": 12500,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-08-24T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### **POST /cases**
Create new case.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Contract Dispute",
  "description": "Contract dispute between parties",
  "clientId": "client_123",
  "assignedTo": "user_123",
  "priority": "high",
  "estimatedHours": 40,
  "billingRate": 500,
  "tags": ["contract", "dispute", "commercial"]
}
```

#### **GET /cases/{caseId}**
Get case by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "case_123",
    "caseNumber": "CASE-2025-001",
    "title": "Contract Dispute",
    "description": "Contract dispute between parties",
    "status": "open",
    "priority": "high",
    "clientId": "client_123",
    "assignedTo": "user_123",
    "estimatedHours": 40,
    "actualHours": 25,
    "billingRate": 500,
    "totalBilled": 12500,
    "tags": ["contract", "dispute", "commercial"],
    "documents": [
      {
        "id": "doc_123",
        "name": "contract.pdf",
        "type": "pdf",
        "size": 1024000,
        "uploadedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "activities": [
      {
        "id": "activity_123",
        "type": "note",
        "description": "Initial case review completed",
        "createdBy": "user_123",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-08-24T10:30:00Z"
  }
}
```

#### **PUT /cases/{caseId}**
Update case by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Updated Contract Dispute",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "assignedTo": "user_456"
}
```

#### **DELETE /cases/{caseId}**
Delete case by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /cases/{caseId}/activities**
Add activity to case.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "type": "note",
  "description": "Case activity description",
  "timeSpent": 2.5,
  "billable": true
}
```

#### **GET /cases/{caseId}/activities**
Get case activities.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /cases/{caseId}/documents**
Upload document to case.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Document file
- `description`: Document description (optional)
- `tags`: Comma-separated tags (optional)

---

### **Document Endpoints**

#### **GET /documents**
Get all documents.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by name or description
- `type` (string): Filter by document type
- `caseId` (string): Filter by case ID
- `clientId` (string): Filter by client ID
- `uploadedBy` (string): Filter by uploader ID
- `dateFrom` (string): Filter by upload date from (ISO 8601)
- `dateTo` (string): Filter by upload date to (ISO 8601)
- `sortBy` (string): Sort field (name, size, uploadedAt)
- `sortOrder` (string): Sort order (asc, desc)

#### **POST /documents**
Upload document.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Document file
- `name`: Document name (optional)
- `description`: Document description (optional)
- `caseId`: Associated case ID (optional)
- `clientId`: Associated client ID (optional)
- `tags`: Comma-separated tags (optional)

#### **GET /documents/{documentId}**
Get document by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **GET /documents/{documentId}/download**
Download document.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /documents/{documentId}**
Update document metadata.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Updated Document Name",
  "description": "Updated description",
  "tags": ["updated", "tags"]
}
```

#### **DELETE /documents/{documentId}**
Delete document.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Client Endpoints**

#### **GET /clients**
Get all clients.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by name or email
- `status` (string): Filter by status (active, inactive)
- `type` (string): Filter by client type (individual, corporate)
- `sortBy` (string): Sort field (name, email, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

#### **POST /clients**
Create new client.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "ABC Corporation",
  "email": "contact@abccorp.com",
  "phone": "+91-9876543210",
  "type": "corporate",
  "address": {
    "street": "456 Business Ave",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400002",
    "country": "India"
  },
  "contactPerson": {
    "name": "John Smith",
    "email": "john@abccorp.com",
    "phone": "+91-9876543211"
  }
}
```

#### **GET /clients/{clientId}**
Get client by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /clients/{clientId}**
Update client by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **DELETE /clients/{clientId}**
Delete client by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **GET /clients/{clientId}/cases**
Get client cases.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **GET /clients/{clientId}/documents**
Get client documents.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Billing Endpoints**

#### **GET /billing/invoices**
Get all invoices.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (draft, sent, paid, overdue)
- `clientId` (string): Filter by client ID
- `dateFrom` (string): Filter by invoice date from (ISO 8601)
- `dateTo` (string): Filter by invoice date to (ISO 8601)
- `sortBy` (string): Sort field (invoiceNumber, amount, dueDate)
- `sortOrder` (string): Sort order (asc, desc)

#### **POST /billing/invoices**
Create new invoice.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "clientId": "client_123",
  "caseId": "case_123",
  "items": [
    {
      "description": "Legal consultation",
      "quantity": 10,
      "rate": 500,
      "amount": 5000
    }
  ],
  "dueDate": "2025-02-15T00:00:00Z",
  "notes": "Payment terms: 30 days"
}
```

#### **GET /billing/invoices/{invoiceId}**
Get invoice by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /billing/invoices/{invoiceId}**
Update invoice by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /billing/invoices/{invoiceId}/send**
Send invoice to client.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /billing/invoices/{invoiceId}/mark-paid**
Mark invoice as paid.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "paymentDate": "2025-08-24T00:00:00Z",
  "paymentMethod": "bank_transfer",
  "reference": "TXN123456"
}
```

#### **GET /billing/time-entries**
Get time entries.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /billing/time-entries**
Create time entry.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "caseId": "case_123",
  "description": "Case research and analysis",
  "hours": 2.5,
  "date": "2025-08-24T00:00:00Z",
  "billable": true,
  "rate": 500
}
```

---

### **Calendar Endpoints**

#### **GET /calendar/events**
Get calendar events.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `start` (string): Start date (ISO 8601)
- `end` (string): End date (ISO 8601)
- `type` (string): Filter by event type (meeting, deadline, court_date)
- `caseId` (string): Filter by case ID
- `clientId` (string): Filter by client ID

#### **POST /calendar/events**
Create calendar event.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Client Meeting",
  "description": "Initial consultation with client",
  "start": "2025-01-20T10:00:00Z",
  "end": "2025-01-20T11:00:00Z",
  "type": "meeting",
  "caseId": "case_123",
  "clientId": "client_123",
  "location": "Conference Room A",
  "attendees": ["user_123", "user_456"],
  "reminder": 30
}
```

#### **GET /calendar/events/{eventId}**
Get event by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /calendar/events/{eventId}**
Update event by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **DELETE /calendar/events/{eventId}**
Delete event by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Report Endpoints**

#### **GET /reports/cases**
Get case reports.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `startDate` (string): Start date (ISO 8601)
- `endDate` (string): End date (ISO 8601)
- `groupBy` (string): Group by (status, priority, assignedTo, client)
- `format` (string): Output format (json, csv, pdf)

#### **GET /reports/billing**
Get billing reports.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `startDate` (string): Start date (ISO 8601)
- `endDate` (string): End date (ISO 8601)
- `groupBy` (string): Group by (client, case, month)
- `format` (string): Output format (json, csv, pdf)

#### **GET /reports/time**
Get time tracking reports.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **GET /reports/productivity**
Get productivity reports.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Support Endpoints**

#### **GET /support/tickets**
Get support tickets.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (open, in_progress, resolved, closed)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `category` (string): Filter by category (technical, billing, training)
- `assignedTo` (string): Filter by assigned user ID

#### **POST /support/tickets**
Create support ticket.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "subject": "Login Issue",
  "description": "Unable to login to the system",
  "priority": "high",
  "category": "technical",
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

#### **GET /support/tickets/{ticketId}**
Get ticket by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /support/tickets/{ticketId}**
Update ticket by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /support/tickets/{ticketId}/comments**
Add comment to ticket.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "comment": "Ticket resolution comment",
  "isInternal": false
}
```

#### **POST /support/tickets/{ticketId}/assign**
Assign ticket to user.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "assignedTo": "user_123"
}
```

---

### **Feedback Endpoints**

#### **GET /feedback**
Get user feedback.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category (bug, feature, improvement)
- `status` (string): Filter by status (new, reviewed, implemented)
- `rating` (number): Filter by rating (1-5)

#### **POST /feedback**
Submit feedback.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "feature": "Case Management",
  "rating": 5,
  "comment": "Excellent feature, very user-friendly",
  "category": "feature",
  "priority": "medium"
}
```

#### **GET /feedback/{feedbackId}**
Get feedback by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **PUT /feedback/{feedbackId}**
Update feedback by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Training Endpoints**

#### **GET /training/modules**
Get training modules.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **GET /training/modules/{moduleId}**
Get training module by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **GET /training/progress**
Get user training progress.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /training/progress**
Update training progress.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "moduleId": "module_123",
  "completedSteps": ["step_1", "step_2"],
  "currentStep": 3,
  "score": 85,
  "timeSpent": 120
}
```

#### **GET /training/certificates**
Get user certificates.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /training/certificates/{moduleId}**
Generate certificate for module.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

---

### **Knowledge Base Endpoints**

#### **GET /knowledge/articles**
Get knowledge base articles.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search articles
- `category` (string): Filter by category
- `tags` (string): Filter by tags (comma-separated)

#### **GET /knowledge/articles/{articleId}**
Get article by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

#### **POST /knowledge/articles/{articleId}/rate**
Rate article.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Very helpful article"
}
```

#### **POST /knowledge/articles/{articleId}/helpful**
Mark article as helpful.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "helpful": true
}
```

---

## 🔌 WebSocket Events

### **Connection**
```javascript
const socket = io('https://api.raghuuco.com', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### **Event Types**

#### **Case Updates**
```javascript
socket.on('case:updated', (data) => {
  console.log('Case updated:', data);
  // data: { caseId, updates, updatedBy, timestamp }
});
```

#### **Document Uploads**
```javascript
socket.on('document:uploaded', (data) => {
  console.log('Document uploaded:', data);
  // data: { documentId, caseId, uploadedBy, timestamp }
});
```

#### **Notifications**
```javascript
socket.on('notification:new', (data) => {
  console.log('New notification:', data);
  // data: { id, type, title, message, timestamp }
});
```

#### **Real-time Collaboration**
```javascript
socket.on('collaboration:user_typing', (data) => {
  console.log('User typing:', data);
  // data: { userId, caseId, timestamp }
});
```

### **Emitting Events**

#### **Join Case Room**
```javascript
socket.emit('case:join', { caseId: 'case_123' });
```

#### **Leave Case Room**
```javascript
socket.emit('case:leave', { caseId: 'case_123' });
```

#### **Send Typing Indicator**
```javascript
socket.emit('collaboration:typing', { 
  caseId: 'case_123', 
  isTyping: true 
});
```

---

## 📚 SDK Examples

### **JavaScript/Node.js SDK**

#### **Installation**
```bash
npm install @raghuuco/api-client
```

#### **Basic Usage**
```javascript
const { RaghuuCOClient } = require('@raghuuco/api-client');

const client = new RaghuuCOClient({
  baseURL: 'https://api.raghuuco.com/v1',
  token: 'your_jwt_token'
});

// Get cases
const cases = await client.cases.list({
  page: 1,
  limit: 20,
  status: 'open'
});

// Create case
const newCase = await client.cases.create({
  title: 'New Case',
  description: 'Case description',
  clientId: 'client_123'
});

// Upload document
const document = await client.documents.upload({
  file: fileBuffer,
  name: 'contract.pdf',
  caseId: 'case_123'
});
```

### **Python SDK**

#### **Installation**
```bash
pip install raghuuco-api-client
```

#### **Basic Usage**
```python
from raghuuco import RaghuuCOClient

client = RaghuuCOClient(
    base_url='https://api.raghuuco.com/v1',
    token='your_jwt_token'
)

# Get cases
cases = client.cases.list(
    page=1,
    limit=20,
    status='open'
)

# Create case
new_case = client.cases.create(
    title='New Case',
    description='Case description',
    client_id='client_123'
)
```

### **cURL Examples**

#### **Authentication**
```bash
# Login
curl -X POST https://api.raghuuco.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Store token
TOKEN=$(curl -s -X POST https://api.raghuuco.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' | \
  jq -r '.data.accessToken')
```

#### **Case Management**
```bash
# Get cases
curl -X GET https://api.raghuuco.com/v1/cases \
  -H "Authorization: Bearer $TOKEN"

# Create case
curl -X POST https://api.raghuuco.com/v1/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Contract Dispute",
    "description": "Contract dispute between parties",
    "clientId": "client_123",
    "priority": "high"
  }'

# Update case
curl -X PUT https://api.raghuuco.com/v1/cases/case_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "medium"
  }'
```

#### **Document Management**
```bash
# Upload document
curl -X POST https://api.raghuuco.com/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf" \
  -F "name=Contract Document" \
  -F "caseId=case_123"

# Download document
curl -X GET https://api.raghuuco.com/v1/documents/doc_123/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_document.pdf
```

#### **Billing**
```bash
# Create invoice
curl -X POST https://api.raghuuco.com/v1/billing/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client_123",
    "caseId": "case_123",
    "items": [
      {
        "description": "Legal consultation",
        "quantity": 10,
        "rate": 500,
        "amount": 5000
      }
    ],
    "dueDate": "2025-02-15T00:00:00Z"
  }'

# Send invoice
curl -X POST https://api.raghuuco.com/v1/billing/invoices/invoice_123/send \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📞 Support

### **API Support**
- **Email**: api-support@raghuuco.com
- **Documentation**: https://docs.raghuuco.com/api
- **Status Page**: https://status.raghuuco.com
- **Developer Forum**: https://community.raghuuco.com

### **Rate Limits**
- **Authentication**: 100 requests/hour
- **Read Operations**: 1000 requests/hour
- **Write Operations**: 500 requests/hour
- **File Uploads**: 100 requests/hour

### **Response Times**
- **Average**: < 200ms
- **95th Percentile**: < 500ms
- **99th Percentile**: < 1000ms

---

**Document Version**: 1.0  
**Last Updated**: August 24, 2025  
**Next Review**: February 15, 2025

**API Version**: v1  
**Base URL**: https://api.raghuuco.com/v1  
**Authentication**: JWT Bearer Token