/**
 * Database Configuration
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Database configuration for PostgreSQL connection
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Default database configuration
 */
export const defaultDatabaseConfig: DatabaseConfig = {
  host: (process as any).env.DB_HOST || 'localhost',
  port: parseInt((process as any).env.DB_PORT || '5432'),
  database: (process as any).env.DB_NAME || 'raghuuco',
  user: (process as any).env.DB_USER || 'raghuuco_user',
  password: (process as any).env.DB_PASSWORD || 'your_secure_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection could not be established
};

/**
 * Get database configuration
 * @param overrides - Optional configuration overrides
 * @returns Database configuration
 */
export function getDatabaseConfig(overrides?: Partial<DatabaseConfig>): DatabaseConfig {
  return {
    ...defaultDatabaseConfig,
    ...overrides
  };
}

/**
 * Validate database configuration
 * @param config - Database configuration to validate
 * @returns True if configuration is valid
 */
export function validateDatabaseConfig(config: DatabaseConfig): boolean {
  return !!(
    config.host &&
    config.port &&
    config.database &&
    config.user &&
    config.password
  );
}