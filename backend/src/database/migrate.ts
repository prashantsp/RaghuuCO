/**
 * Database Migration System
 * Sets up the complete PostgreSQL database schema for RAGHUU CO Legal Practice Management System
 */

import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'raghuuco_legal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const db = new DatabaseService(databaseConfig);

/**
 * Complete database schema creation
 */
async function createSchema(): Promise<void> {
  try {
    logger.info('Starting database schema creation...');

    // Create enums
    await createEnums();
    
    // Create tables
    await createTables();
    
    // Create indexes
    await createIndexes();
    
    // Insert initial data
    await insertInitialData();
    
    logger.info('Database schema creation completed successfully');
  } catch (error) {
    logger.error('Database schema creation failed', error as Error);
    throw error;
  }
}

async function createEnums(): Promise<void> {
  const enums = [
    `CREATE TYPE user_role AS ENUM (
      'super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client', 'guest'
    )`,
    `CREATE TYPE client_type_enum AS ENUM ('individual', 'company')`,
    `CREATE TYPE case_type_enum AS ENUM ('constitutional', 'real_estate', 'banking', 'company')`,
    `CREATE TYPE case_status_enum AS ENUM ('active', 'pending', 'completed', 'on_hold')`,
    `CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'urgent')`,
    `CREATE TYPE billing_type_enum AS ENUM ('hourly', 'fixed', 'contingency')`,
    `CREATE TYPE document_type_enum AS ENUM ('pleading', 'contract', 'evidence', 'correspondence', 'court_order', 'research')`,
    `CREATE TYPE event_type_enum AS ENUM ('court_hearing', 'client_meeting', 'deadline', 'reminder', 'internal_meeting')`,
    `CREATE TYPE content_status_enum AS ENUM ('draft', 'review', 'published', 'archived')`,
    `CREATE TYPE comment_status_enum AS ENUM ('pending', 'approved', 'rejected')`,
    `CREATE TYPE newsletter_status_enum AS ENUM ('draft', 'scheduled', 'sent')`,
    `CREATE TYPE content_type_enum AS ENUM ('article', 'newsletter')`,
    `CREATE TYPE analytics_action_enum AS ENUM ('view', 'like', 'share', 'comment')`
  ];

  for (const enumQuery of enums) {
    try {
      await db.query(enumQuery);
      logger.info(`Created enum: ${enumQuery.split('AS ENUM')[0].split('CREATE TYPE')[1].trim()}`);
    } catch (error: any) {
      if (error.code !== '42710') { // Skip if enum already exists
        throw error;
      }
    }
  }
}

async function createTables(): Promise<void> {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role user_role NOT NULL,
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Social accounts table
    `CREATE TABLE IF NOT EXISTS social_accounts (
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
    )`,

    // Clients table
    `CREATE TABLE IF NOT EXISTS clients (
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
    )`,

    // Cases table
    `CREATE TABLE IF NOT EXISTS cases (
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
    )`,

    // Documents table
    `CREATE TABLE IF NOT EXISTS documents (
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
    )`,

    // Time entries table
    `CREATE TABLE IF NOT EXISTS time_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES cases(id),
      user_id UUID NOT NULL REFERENCES users(id),
      task_description TEXT NOT NULL,
      hours_worked DECIMAL(4,2) NOT NULL,
      billing_rate DECIMAL(8,2),
      is_billable BOOLEAN DEFAULT true,
      date_worked DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Calendar events table
    `CREATE TABLE IF NOT EXISTS calendar_events (
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
      reminder_intervals INTEGER[] DEFAULT '{1440, 60}',
      google_calendar_id VARCHAR(255),
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Audit logs table
    `CREATE TABLE IF NOT EXISTS audit_logs (
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
    )`,

    // User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      session_token VARCHAR(255) UNIQUE NOT NULL,
      refresh_token VARCHAR(255) UNIQUE NOT NULL,
      ip_address INET,
      user_agent TEXT,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const tableQuery of tables) {
    await db.query(tableQuery);
    const tableName = tableQuery.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    logger.info(`Created table: ${tableName}`);
  }
}

async function createIndexes(): Promise<void> {
  const indexes = [
    // Users indexes
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)',
    
    // Cases indexes
    'CREATE INDEX IF NOT EXISTS idx_cases_number ON cases(case_number)',
    'CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status)',
    'CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(case_type)',
    'CREATE INDEX IF NOT EXISTS idx_cases_partner ON cases(assigned_partner)',
    'CREATE INDEX IF NOT EXISTS idx_cases_associates ON cases USING GIN(assigned_associates)',
    
    // Documents indexes
    'CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type)',
    'CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by)',
    
    // Time entries indexes
    'CREATE INDEX IF NOT EXISTS idx_time_entries_case_id ON time_entries(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date_worked)',
    
    // Audit logs indexes
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)',
    
    // Sessions indexes
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)'
  ];

  for (const indexQuery of indexes) {
    await db.query(indexQuery);
    const indexName = indexQuery.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1];
    logger.info(`Created index: ${indexName}`);
  }
}

async function insertInitialData(): Promise<void> {
  // Create super admin user
  const superAdminData = {
    email: 'admin@raghuuco.com',
    passwordHash: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    phone: '+91-9876543210',
    isActive: true,
    emailVerified: true
  };

  try {
    await db.createUser(superAdminData);
    logger.info('Created super admin user');
  } catch (error: any) {
    if (error.code !== '23505') { // Skip if user already exists
      throw error;
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createSchema()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed', error);
      process.exit(1);
    });
}

export { createSchema };