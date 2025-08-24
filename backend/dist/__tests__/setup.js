"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../../.env.test') });
jest.mock('@/services/DatabaseService', () => {
    return jest.fn().mockImplementation(() => ({
        query: jest.fn(),
        transaction: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn()
    }));
});
jest.mock('@/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    businessEvent: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
    sign: jest.fn()
}));
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));
jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
global.testUtils = {
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
afterEach(() => {
    jest.clearAllMocks();
});
afterAll(() => {
    jest.restoreAllMocks();
});
//# sourceMappingURL=setup.js.map