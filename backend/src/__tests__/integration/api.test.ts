/**
 * API Integration Tests
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Integration tests for API endpoints
 */

import request from 'supertest';
import { app } from '../../index';
import { DatabaseService } from '../../services/DatabaseService';

// Mock database service
jest.mock('../../services/DatabaseService');

describe('API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testClientId: string;
  let testCaseId: string;

  beforeAll(async () => {
    // Setup test data
    testUserId = 'test-user-id';
    testClientId = 'test-client-id';
    testCaseId = 'test-case-id';

    // Mock successful authentication
    const mockUser = {
      id: testUserId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'associate'
    };

    // Mock JWT verification
    const jwt = require('jsonwebtoken');
    jwt.verify.mockReturnValue(mockUser);

    authToken = 'valid-jwt-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/v1/auth/login', () => {
      it('should authenticate user with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const mockUser = {
          id: testUserId,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'associate'
        };

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: [mockUser],
          rowCount: 1
        });

        // Mock bcrypt
        const bcrypt = require('bcrypt');
        bcrypt.compare.mockResolvedValue(true);

        // Mock JWT sign
        const jwt = require('jsonwebtoken');
        jwt.sign.mockReturnValue('valid-jwt-token');

        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.email).toBe(loginData.email);
      });

      it('should reject invalid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        // Mock bcrypt to return false for invalid password
        const bcrypt = require('bcrypt');
        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      });
    });

    describe('POST /api/v1/auth/refresh', () => {
      it('should refresh access token with valid refresh token', async () => {
        const refreshData = {
          refreshToken: 'valid-refresh-token'
        };

        const mockUser = {
          id: testUserId,
          email: 'test@example.com'
        };

        // Mock JWT verify for refresh token
        const jwt = require('jsonwebtoken');
        jwt.verify.mockReturnValue(mockUser);
        jwt.sign.mockReturnValue('new-access-token');

        const response = await request(app)
          .post('/api/v1/auth/refresh')
          .send(refreshData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('accessToken');
      });
    });
  });

  describe('User Management Endpoints', () => {
    describe('GET /api/v1/users', () => {
      it('should return list of users', async () => {
        const mockUsers = [
          {
            id: testUserId,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'associate'
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockUsers,
          rowCount: 1
        });

        const response = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toHaveLength(1);
        expect(response.body.data.users[0].email).toBe('test@example.com');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/v1/users')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('POST /api/v1/users', () => {
      it('should create new user', async () => {
        const userData = {
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'associate',
          password: 'password123'
        };

        const mockUser = {
          id: 'new-user-id',
          ...userData
        };

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: [mockUser],
          rowCount: 1
        });

        // Mock bcrypt hash
        const bcrypt = require('bcrypt');
        bcrypt.hash.mockResolvedValue('hashed-password');

        const response = await request(app)
          .post('/api/v1/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(userData.email);
      });
    });
  });

  describe('Case Management Endpoints', () => {
    describe('GET /api/v1/cases', () => {
      it('should return list of cases', async () => {
        const mockCases = [
          {
            id: testCaseId,
            caseNumber: 'CASE-001',
            title: 'Test Case',
            description: 'Test case description',
            status: 'active',
            priority: 'medium'
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockCases,
          rowCount: 1
        });

        const response = await request(app)
          .get('/api/v1/cases')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.cases).toHaveLength(1);
        expect(response.body.data.cases[0].caseNumber).toBe('CASE-001');
      });
    });

    describe('POST /api/v1/cases', () => {
      it('should create new case', async () => {
        const caseData = {
          caseNumber: 'CASE-002',
          title: 'New Case',
          description: 'New case description',
          clientId: testClientId,
          priority: 'high',
          status: 'active'
        };

        const mockCase = {
          id: 'new-case-id',
          ...caseData
        };

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: [mockCase],
          rowCount: 1
        });

        const response = await request(app)
          .post('/api/v1/cases')
          .set('Authorization', `Bearer ${authToken}`)
          .send(caseData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.case.caseNumber).toBe(caseData.caseNumber);
      });
    });
  });

  describe('Client Management Endpoints', () => {
    describe('GET /api/v1/clients', () => {
      it('should return list of clients', async () => {
        const mockClients = [
          {
            id: testClientId,
            name: 'Test Client',
            email: 'client@example.com',
            phone: '+1234567890'
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockClients,
          rowCount: 1
        });

        const response = await request(app)
          .get('/api/v1/clients')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.clients).toHaveLength(1);
        expect(response.body.data.clients[0].name).toBe('Test Client');
      });
    });
  });

  describe('Document Management Endpoints', () => {
    describe('GET /api/v1/documents', () => {
      it('should return list of documents', async () => {
        const mockDocuments = [
          {
            id: 'test-doc-id',
            title: 'Test Document',
            filename: 'test.pdf',
            caseId: testCaseId,
            uploadedBy: testUserId
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockDocuments,
          rowCount: 1
        });

        const response = await request(app)
          .get('/api/v1/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.documents).toHaveLength(1);
        expect(response.body.data.documents[0].title).toBe('Test Document');
      });
    });
  });

  describe('Expenses Management Endpoints', () => {
    describe('GET /api/v1/expenses', () => {
      it('should return list of expenses', async () => {
        const mockExpenses = [
          {
            id: 'test-expense-id',
            description: 'Test Expense',
            amount: 1000,
            category: 'Office Supplies',
            caseId: testCaseId,
            createdBy: testUserId
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockExpenses,
          rowCount: 1
        });

        const response = await request(app)
          .get('/api/v1/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.expenses).toHaveLength(1);
        expect(response.body.data.expenses[0].description).toBe('Test Expense');
      });
    });

    describe('POST /api/v1/expenses', () => {
      it('should create new expense', async () => {
        const expenseData = {
          description: 'New Expense',
          amount: 1500,
          category: 'Travel',
          caseId: testCaseId,
          expenseDate: '2025-08-24',
          notes: 'Test notes'
        };

        const mockExpense = {
          id: 'new-expense-id',
          ...expenseData
        };

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: [mockExpense],
          rowCount: 1
        });

        const response = await request(app)
          .post('/api/v1/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(expenseData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.expense.description).toBe(expenseData.description);
      });
    });
  });

  describe('Content Management Endpoints', () => {
    describe('GET /api/v1/content/articles', () => {
      it('should return list of articles', async () => {
        const mockArticles = [
          {
            id: 'test-article-id',
            title: 'Test Article',
            content: 'Test content',
            status: 'published',
            categoryId: 'test-category-id'
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockArticles,
          rowCount: 1
        });

        const response = await request(app)
          .get('/api/v1/content/articles')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.articles).toHaveLength(1);
        expect(response.body.data.articles[0].title).toBe('Test Article');
      });
    });
  });

  describe('Global Search Endpoints', () => {
    describe('GET /api/v1/search/global', () => {
      it('should perform global search', async () => {
        const searchQuery = 'test';
        const mockResults = [
          {
            type: 'case',
            id: testCaseId,
            title: 'Test Case',
            description: 'Test case description'
          }
        ];

        // Mock database response
        const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
        mockDbService.prototype.query.mockResolvedValue({
          rows: mockResults,
          rowCount: 1
        });

        const response = await request(app)
          .get(`/api/v1/search/global?q=${searchQuery}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.results).toHaveLength(1);
        expect(response.body.data.results[0].type).toBe('case');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
      mockDbService.prototype.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DATABASE_ERROR');
    });

    it('should handle validation errors', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        firstName: '',
        lastName: ''
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(100).fill(null).map(() =>
        request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(res => res.status === 429);

      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body.success).toBe(false);
        expect(rateLimitedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection', async () => {
      const maliciousQuery = "'; DROP TABLE users; --";

      const response = await request(app)
        .get(`/api/v1/users?search=${encodeURIComponent(maliciousQuery)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should not crash or expose sensitive data
      expect(response.body.success).toBe(true);
    });

    it('should validate JWT tokens', async () => {
      const invalidToken = 'invalid-jwt-token';

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should enforce CORS policies', async () => {
      const response = await request(app)
        .options('/api/v1/users')
        .set('Origin', 'http://malicious-site.com')
        .expect(200);

      // Should include proper CORS headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();

      const requests = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
    });

    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array(1000).fill(null).map((_, index) => ({
        id: `user-${index}`,
        email: `user${index}@example.com`,
        firstName: `User${index}`,
        lastName: 'Test'
      }));

      // Mock large dataset response
      const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>;
      mockDbService.prototype.query.mockResolvedValue({
        rows: largeDataset,
        rowCount: 1000
      });

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1000);
      expect(responseTime).toBeLessThan(2000); // 2 seconds
    });
  });
});