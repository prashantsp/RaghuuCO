"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultDatabaseConfig = void 0;
exports.getDatabaseConfig = getDatabaseConfig;
exports.validateDatabaseConfig = validateDatabaseConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.defaultDatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'raghuuco',
    user: process.env.DB_USER || 'raghuuco_user',
    password: process.env.DB_PASSWORD || 'your_secure_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};
function getDatabaseConfig(overrides) {
    return {
        ...exports.defaultDatabaseConfig,
        ...overrides
    };
}
function validateDatabaseConfig(config) {
    return !!(config.host &&
        config.port &&
        config.database &&
        config.user &&
        config.password);
}
//# sourceMappingURL=database.js.map