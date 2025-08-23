# Developer Technical Guide
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: August 22, 2025

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack Details](#technology-stack-details)
3. [Database Implementation](#database-implementation)
4. [API Design Patterns](#api-design-patterns)
5. [Frontend Architecture](#frontend-architecture)
6. [Security Implementation](#security-implementation)
7. [Authentication Flow](#authentication-flow)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & DevOps](#deployment--devops)
11. [Code Standards](#code-standards)
12. [Integration Patterns](#integration-patterns)

---

## System Architecture Overview

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis         │    │   File Storage  │    │   External      │
│   (Sessions)    │    │   (AWS S3)      │    │   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Microservices Architecture**
- **User Service**: Authentication, user management
- **Case Service**: Case management, workflow
- **Document Service**: File management, versioning
- **Billing Service**: Time tracking, invoicing
- **Notification Service**: Email, SMS, in-app notifications
- **Analytics Service**: Reporting, metrics

---

## Technology Stack Details

### **Frontend Stack**
```typescript
// Core Technologies
React 18.x
TypeScript 5.x
Material-UI (MUI) 5.x
ag-grid-community 30.x

// State Management
Redux Toolkit 1.9.x
React Query 4.x

// Routing & Forms
React Router v6
React Hook Form 7.x
Yup validation

// Build Tools
Vite 4.x
ESLint + Prettier
Jest + React Testing Library
```

### **Backend Stack**
```typescript
// Core Technologies
Node.js 18.x LTS
Express.js 4.x
TypeScript 5.x

// Database
PostgreSQL 14+
pg library (raw SQL)
Redis 7.x (sessions, caching)

// Authentication
Passport.js 0.6.x
JWT + Refresh Tokens
bcrypt 5.x

// File Handling
Multer 1.4.x
Sharp (image processing)

// Background Jobs
Bull Queue 4.x
Redis (queue storage)
```

### **DevOps & Infrastructure**
```yaml
# Containerization
Docker 20.x
Docker Compose 2.x

# Cloud Platform
AWS/Azure (production)
Local development environment

# Monitoring
Prometheus + Grafana
Winston logging
Sentry (error tracking)

# CI/CD
GitHub Actions
Automated testing
Deployment pipelines
```

---

## Database Implementation

### **Raw SQL Approach**
```typescript
// Database Service Implementation
class DatabaseService {
  private pool: Pool;
  
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
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
}

// Usage Examples
const db = new DatabaseService();

// Simple query
const users = await db.query<User>(
  'SELECT * FROM users WHERE role = $1 AND is_active = $2',
  ['partner', true]
);

// Transaction example
await db.transaction(async (client) => {
  const user = await client.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, role]
  );
  
  await client.query(
    'INSERT INTO audit_logs (user_id, action, resource_type) VALUES ($1, $2, $3)',
    [user[0].id, 'USER_CREATED', 'users']
  );
  
  return user[0];
});
```

### **Query Optimization Patterns**
```sql
-- Indexed queries for performance
CREATE INDEX idx_cases_client_id_status ON cases(client_id, status);
CREATE INDEX idx_documents_case_id_type ON documents(case_id, document_type);
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, date_worked);

-- Efficient pagination
SELECT * FROM cases 
WHERE client_id = $1 
ORDER BY created_at DESC 
LIMIT $2 OFFSET $3;

-- Full-text search
CREATE INDEX idx_articles_content_fts ON articles USING GIN(to_tsvector('english', content));
SELECT * FROM articles 
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1);
```

---

## API Design Patterns

### **RESTful API Structure**
```typescript
// API Routes Structure
/api/v1/
├── auth/
│   ├── login
│   ├── register
│   ├── refresh
│   ├── logout
│   └── social/:provider
├── users/
│   ├── profile
│   ├── settings
│   └── permissions
├── cases/
│   ├── list
│   ├── create
│   ├── :id
│   ├── :id/documents
│   ├── :id/timeline
│   └── :id/billing
├── documents/
│   ├── upload
│   ├── :id
│   ├── :id/versions
│   └── :id/permissions
├── billing/
│   ├── time-entries
│   ├── invoices
│   └── reports
└── analytics/
    ├── dashboard
    ├── reports
    └── exports
```

### **API Response Patterns**
```typescript
// Standard API Response Interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

// Success Response Example
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Case Title",
    "status": "active"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Error Response Example
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

### **Middleware Patterns**
```typescript
// Authentication Middleware
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_MISSING', message: 'Access token required' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' }
    });
  }
};

// Role-based Authorization
const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Access denied' }
      });
    }
    next();
  };
};

// Rate Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }
  }
});
```

---

## Frontend Architecture

### **Component Structure**
```typescript
// Component Hierarchy
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── DataTable/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   └── features/
│       ├── cases/
│       ├── documents/
│       ├── billing/
│       └── analytics/
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── storage.ts
├── store/
│   ├── slices/
│   └── index.ts
└── utils/
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

### **State Management Pattern**
```typescript
// Redux Toolkit Slice Example
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for API calls
export const fetchCases = createAsyncThunk(
  'cases/fetchCases',
  async (params: CaseFilters, { rejectWithValue }) => {
    try {
      const response = await api.get('/cases', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice definition
const casesSlice = createSlice({
  name: 'cases',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.meta.pagination;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});
```

### **Custom Hooks Pattern**
```typescript
// Custom hook for API calls
export const useApi = <T>(endpoint: string, options?: UseApiOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(endpoint, { params });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error, execute };
};

// Usage in components
const CasesList = () => {
  const { data: cases, loading, error, execute } = useApi<Case[]>('/cases');
  
  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <CasesTable cases={cases} />;
};
```

---

## Security Implementation

### **Authentication Flow**
```typescript
// JWT Token Management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// API Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        const response = await api.post('/auth/refresh', { refreshToken });
        
        TokenManager.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        originalRequest.headers['Authorization'] = 
          `Bearer ${response.data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### **Data Validation & Sanitization**
```typescript
// Input Validation Schemas
import * as yup from 'yup';

export const caseSchema = yup.object({
  title: yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters'),
  description: yup.string()
    .required('Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  caseType: yup.string()
    .required('Case type is required')
    .oneOf(['constitutional', 'real_estate', 'banking', 'company']),
  clientId: yup.string()
    .required('Client is required')
    .uuid('Invalid client ID format'),
  caseValue: yup.number()
    .positive('Case value must be positive')
    .nullable(),
  startDate: yup.date()
    .required('Start date is required')
    .max(new Date(), 'Start date cannot be in the future')
});

// SQL Injection Prevention
const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input.replace(/[<>'"]/g, '');
};

const buildSafeQuery = (baseQuery: string, params: any[]): string => {
  // Use parameterized queries only
  return baseQuery;
};

// Usage
const searchCases = async (searchTerm: string) => {
  const sanitizedTerm = sanitizeInput(searchTerm);
  const query = `
    SELECT * FROM cases 
    WHERE title ILIKE $1 OR description ILIKE $1
    ORDER BY created_at DESC
  `;
  return await db.query(query, [`%${sanitizedTerm}%`]);
};
```

---

## Performance Optimization

### **Database Optimization**
```sql
-- Connection Pooling Configuration
-- postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Query Optimization
-- Use EXPLAIN ANALYZE for query analysis
EXPLAIN ANALYZE SELECT * FROM cases WHERE client_id = $1;

-- Index Strategy
CREATE INDEX CONCURRENTLY idx_cases_composite 
ON cases(client_id, status, created_at);

-- Partitioning for large tables
CREATE TABLE audit_logs_partitioned (
  LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Caching Strategy
-- Redis caching for frequently accessed data
const cacheKey = `case:${caseId}`;
const cachedCase = await redis.get(cacheKey);
if (cachedCase) {
  return JSON.parse(cachedCase);
}

const case = await db.query('SELECT * FROM cases WHERE id = $1', [caseId]);
await redis.setex(cacheKey, 3600, JSON.stringify(case)); // 1 hour cache
```

### **Frontend Performance**
```typescript
// React.memo for component optimization
const CaseCard = React.memo(({ case, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{case.title}</Typography>
        <Typography variant="body2">{case.description}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => onEdit(case.id)}>Edit</Button>
        <Button onClick={() => onDelete(case.id)}>Delete</Button>
      </CardActions>
    </Card>
  );
});

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedCasesList = ({ cases }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CaseCard case={cases[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={cases.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};

// Lazy loading for routes
const Cases = lazy(() => import('./pages/Cases'));
const Documents = lazy(() => import('./pages/Documents'));

// Code splitting
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/cases" element={<Cases />} />
      <Route path="/documents" element={<Documents />} />
    </Routes>
  </Suspense>
);
```

---

## Testing Strategy

### **Backend Testing**
```typescript
// Unit Tests with Jest
describe('CaseService', () => {
  let caseService: CaseService;
  let mockDb: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    mockDb = createMockDatabaseService();
    caseService = new CaseService(mockDb);
  });

  describe('createCase', () => {
    it('should create a new case successfully', async () => {
      const caseData = {
        title: 'Test Case',
        description: 'Test Description',
        clientId: 'uuid',
        caseType: 'real_estate'
      };

      mockDb.query.mockResolvedValueOnce([{ id: 'new-uuid', ...caseData }]);

      const result = await caseService.createCase(caseData);

      expect(result).toHaveProperty('id');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cases'),
        expect.arrayContaining([caseData.title, caseData.description])
      );
    });

    it('should throw error for invalid case type', async () => {
      const caseData = {
        title: 'Test Case',
        caseType: 'invalid_type'
      };

      await expect(caseService.createCase(caseData))
        .rejects
        .toThrow('Invalid case type');
    });
  });
});

// Integration Tests
describe('Case API Integration', () => {
  let app: Express;
  let agent: SuperTest<Test>;

  beforeAll(async () => {
    app = createTestApp();
    agent = request(app);
  });

  it('should create case via API', async () => {
    const caseData = {
      title: 'API Test Case',
      description: 'Test Description',
      clientId: 'test-client-id',
      caseType: 'real_estate'
    };

    const response = await agent
      .post('/api/v1/cases')
      .set('Authorization', `Bearer ${testToken}`)
      .send(caseData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(caseData.title);
  });
});
```

### **Frontend Testing**
```typescript
// Component Testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('CasesList Component', () => {
  it('should render cases list', async () => {
    const mockCases = [
      { id: '1', title: 'Case 1', status: 'active' },
      { id: '2', title: 'Case 2', status: 'pending' }
    ];

    jest.spyOn(api, 'get').mockResolvedValue({ data: mockCases });

    renderWithProviders(<CasesList />);

    await waitFor(() => {
      expect(screen.getByText('Case 1')).toBeInTheDocument();
      expect(screen.getByText('Case 2')).toBeInTheDocument();
    });
  });

  it('should handle search functionality', async () => {
    renderWithProviders(<CasesList />);

    const searchInput = screen.getByPlaceholderText('Search cases...');
    fireEvent.change(searchInput, { target: { value: 'Case 1' } });

    await waitFor(() => {
      expect(screen.getByText('Case 1')).toBeInTheDocument();
      expect(screen.queryByText('Case 2')).not.toBeInTheDocument();
    });
  });
});

// E2E Testing with Playwright
import { test, expect } from '@playwright/test';

test('user can create a new case', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');

  await page.waitForURL('/dashboard');
  await page.click('[data-testid="new-case-button"]');

  await page.fill('[data-testid="case-title"]', 'New Test Case');
  await page.fill('[data-testid="case-description"]', 'Test Description');
  await page.selectOption('[data-testid="case-type"]', 'real_estate');
  await page.click('[data-testid="save-case-button"]');

  await expect(page.locator('text=New Test Case')).toBeVisible();
});
```

---

## Deployment & DevOps

### **Docker Configuration**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=raghuuco
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
  redis_data:
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: build-files
      - name: Deploy to AWS
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://raghuuco-app
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

---

## Code Standards

### **TypeScript Configuration**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### **ESLint Configuration**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

---

## Integration Patterns

### **External API Integration**
```typescript
// Payment Gateway Integration
class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createPayment(amount: number, currency: string = 'INR') {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    const text = `${orderId}|${paymentId}`;
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  }
}

// Email Service Integration
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendInvoiceEmail(invoice: Invoice, client: Client) {
    const template = await this.loadEmailTemplate('invoice');
    const html = template
      .replace('{{clientName}}', client.name)
      .replace('{{invoiceNumber}}', invoice.number)
      .replace('{{amount}}', invoice.amount);

    await this.transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: client.email,
      subject: `Invoice #${invoice.number} from RaghuuCO`,
      html
    });
  }
}
```

### **File Upload & Storage**
```typescript
// AWS S3 Integration
class FileStorageService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    try {
      await this.s3.upload(params).promise();
      return key;
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn
    };

    return this.s3.getSignedUrl('getObject', params);
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await this.s3.deleteObject(params).promise();
  }
}
```

---

This comprehensive technical guide provides developers with all the necessary information to understand and implement the RaghuuCO Legal Practice Management System effectively.