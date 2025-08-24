/**
 * Backend Test Setup
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Test setup configuration for Jest with database mocking and environment setup
 */

import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.join(__dirname, '../../.env.test') });

// Mock database for tests
jest.mock('@/services/DatabaseService', () => {
  return jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    transaction: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }));
});

// Mock logger for tests
jest.mock('@/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  businessEvent: jest.fn()
}));

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Global test timeout
jest.setTimeout(30000);

// Test environment setup
(process as any).env.NODE_ENV = 'test';
(process as any).env.JWT_SECRET = 'test-secret-key';
(process as any).env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
(process as any).env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global test utilities
(global as any).testUtils = {
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'associate'
  },
  mockClient: {
    id: 'test-client-id',
    name: 'Test Client',
    email: 'client@example.com',
    phone: '+1234567890'
  },
  mockCase: {
    id: 'test-case-id',
    caseNumber: 'CASE-001',
    title: 'Test Case',
    description: 'Test case description',
    status: 'active',
    priority: 'medium'
  }
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  jest.restoreAllMocks();
});