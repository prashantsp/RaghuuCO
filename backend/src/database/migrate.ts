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
    `CREATE TYPE analytics_action_enum AS ENUM ('view', 'like', 'share', 'comment')`,
    `CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled')`,
    `CREATE TYPE payment_method_enum AS ENUM ('cash', 'cheque', 'bank_transfer', 'credit_card', 'razorpay', 'payu')`,
    `CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded')`,
    `CREATE TYPE invoice_item_type_enum AS ENUM ('time', 'expense', 'service', 'product')`,
    `CREATE TYPE calendar_event_type_enum AS ENUM ('court_hearing', 'client_meeting', 'deadline', 'reminder', 'internal_meeting')`,
    `CREATE TYPE calendar_event_status_enum AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled')`,
    `CREATE TYPE calendar_event_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent')`,
    `CREATE TYPE external_calendar_provider_enum AS ENUM ('google', 'outlook', 'yahoo')`,
    `CREATE TYPE court_hearing_type_enum AS ENUM ('trial', 'pre_trial', 'hearing', 'conference')`,
    `CREATE TYPE court_date_status_enum AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled')`,
    `CREATE TYPE calendar_attendee_status_enum AS ENUM ('pending', 'accepted', 'declined', 'tentative')`,
    `CREATE TYPE reminder_type_enum AS ENUM ('email', 'sms', 'push', 'in_app')`,
    `CREATE TYPE reminder_status_enum AS ENUM ('pending', 'sent', 'failed', 'cancelled')`,
    `CREATE TYPE internal_message_type_enum AS ENUM ('general', 'task', 'alert', 'notification')`,
    `CREATE TYPE internal_message_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent')`,
    `CREATE TYPE message_recipient_status_enum AS ENUM ('unread', 'read', 'responded', 'dismissed')`,
    `CREATE TYPE email_template_type_enum AS ENUM ('html', 'plain_text')`,
    `CREATE TYPE email_status_enum AS ENUM ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked', 'unsubscribed')`,
    `CREATE TYPE sms_status_enum AS ENUM ('pending', 'sent', 'failed', 'delivered', 'undelivered', 'rejected')`,
    `CREATE TYPE notification_type_enum AS ENUM ('email', 'sms', 'push', 'in_app')`
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
      event_type calendar_event_type_enum NOT NULL,
      start_datetime TIMESTAMP NOT NULL,
      end_datetime TIMESTAMP NOT NULL,
      all_day BOOLEAN DEFAULT false,
      location VARCHAR(500),
      case_id UUID REFERENCES cases(id),
      client_id UUID REFERENCES clients(id),
      assigned_to UUID REFERENCES users(id),
      created_by UUID REFERENCES users(id),
      status calendar_event_status_enum DEFAULT 'scheduled',
      priority calendar_event_priority_enum DEFAULT 'medium',
      reminder_minutes INTEGER DEFAULT 15,
      external_calendar_id VARCHAR(255),
      external_calendar_provider external_calendar_provider_enum,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Calendar event attendees table
    `CREATE TABLE IF NOT EXISTS calendar_event_attendees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id),
      client_id UUID REFERENCES clients(id),
      email VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      response_status calendar_attendee_status_enum DEFAULT 'pending',
      response_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Calendar event reminders table
    `CREATE TABLE IF NOT EXISTS calendar_event_reminders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
      reminder_type reminder_type_enum NOT NULL,
      reminder_time TIMESTAMP NOT NULL,
      sent_at TIMESTAMP,
      status reminder_status_enum DEFAULT 'pending',
      recipient_email VARCHAR(255),
      recipient_phone VARCHAR(20),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Court dates table
    `CREATE TABLE IF NOT EXISTS court_dates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id UUID NOT NULL REFERENCES cases(id),
      court_name VARCHAR(255) NOT NULL,
      court_address TEXT,
      case_number VARCHAR(100),
      hearing_type court_hearing_type_enum NOT NULL,
      scheduled_date TIMESTAMP NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      judge_name VARCHAR(255),
      opposing_counsel VARCHAR(255),
      notes TEXT,
      status court_date_status_enum DEFAULT 'scheduled',
      assigned_to UUID REFERENCES users(id),
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Internal messages table
    `CREATE TABLE IF NOT EXISTS internal_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      sender_id UUID NOT NULL REFERENCES users(id),
      message_type internal_message_type_enum DEFAULT 'general',
      priority internal_message_priority_enum DEFAULT 'normal',
      is_urgent BOOLEAN DEFAULT false,
      requires_response BOOLEAN DEFAULT false,
      response_deadline TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Message recipients table
    `CREATE TABLE IF NOT EXISTS message_recipients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
      recipient_id UUID REFERENCES users(id),
      recipient_email VARCHAR(255),
      recipient_name VARCHAR(255) NOT NULL,
      read_at TIMESTAMP,
      responded_at TIMESTAMP,
      response_content TEXT,
      status message_recipient_status_enum DEFAULT 'unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Email templates table
    `CREATE TABLE IF NOT EXISTS email_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      template_type email_template_type_enum NOT NULL,
      variables JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Email logs table
    `CREATE TABLE IF NOT EXISTS email_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id UUID REFERENCES email_templates(id),
      recipient_email VARCHAR(255) NOT NULL,
      recipient_name VARCHAR(255),
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      case_id UUID REFERENCES cases(id),
      client_id UUID REFERENCES clients(id),
      status email_status_enum DEFAULT 'pending',
      sent_at TIMESTAMP,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // SMS logs table
    `CREATE TABLE IF NOT EXISTS sms_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipient_phone VARCHAR(20) NOT NULL,
      recipient_name VARCHAR(255),
      message TEXT NOT NULL,
      case_id UUID REFERENCES cases(id),
      client_id UUID REFERENCES clients(id),
      status sms_status_enum DEFAULT 'pending',
      sent_at TIMESTAMP,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Notification preferences table
    `CREATE TABLE IF NOT EXISTS notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      notification_type notification_type_enum NOT NULL,
      email_enabled BOOLEAN DEFAULT true,
      sms_enabled BOOLEAN DEFAULT false,
      push_enabled BOOLEAN DEFAULT true,
      in_app_enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, notification_type)
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
    )`,

    // Billing rates table
    `CREATE TABLE IF NOT EXISTS billing_rates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      case_type case_type_enum,
      hourly_rate DECIMAL(10,2) NOT NULL,
      is_default BOOLEAN DEFAULT false,
      effective_date DATE NOT NULL,
      end_date DATE,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Invoices table
    `CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      case_id UUID NOT NULL REFERENCES cases(id),
      client_id UUID NOT NULL REFERENCES clients(id),
      user_id UUID NOT NULL REFERENCES users(id),
      status invoice_status_enum DEFAULT 'draft',
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(3) DEFAULT 'INR',
      due_date DATE,
      issued_date DATE,
      paid_date DATE,
      payment_method payment_method_enum,
      notes TEXT,
      terms_conditions TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Invoice items table
    `CREATE TABLE IF NOT EXISTS invoice_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      time_entry_id UUID REFERENCES time_entries(id),
      description TEXT NOT NULL,
      quantity DECIMAL(8,2) NOT NULL,
      unit_rate DECIMAL(10,2) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      item_type invoice_item_type_enum DEFAULT 'time',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Payments table
    `CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id UUID NOT NULL REFERENCES invoices(id),
      payment_number VARCHAR(50) UNIQUE NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      payment_date DATE NOT NULL,
      payment_method payment_method_enum NOT NULL,
      transaction_id VARCHAR(255),
      status payment_status_enum DEFAULT 'pending',
      gateway_response JSONB,
      notes TEXT,
      created_by UUID REFERENCES users(id),
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
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)',
    
    // Billing rates indexes
    'CREATE INDEX IF NOT EXISTS idx_billing_rates_user_id ON billing_rates(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_billing_rates_case_type ON billing_rates(case_type)',
    'CREATE INDEX IF NOT EXISTS idx_billing_rates_effective_date ON billing_rates(effective_date)',
    
    // Invoices indexes
    'CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_case_id ON invoices(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date)',
    
    // Invoice items indexes
    'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoice_items_time_entry_id ON invoice_items(time_entry_id)',
    
    // Payments indexes
    'CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_payments_number ON payments(payment_number)',
    'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
    'CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date)',

    // Calendar events indexes
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_start_datetime ON calendar_events(start_datetime)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_end_datetime ON calendar_events(end_datetime)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_assigned_to ON calendar_events(assigned_to)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON calendar_events(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by)',

    // Calendar event attendees indexes
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_attendees_event_id ON calendar_event_attendees(event_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_attendees_user_id ON calendar_event_attendees(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_attendees_client_id ON calendar_event_attendees(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_attendees_email ON calendar_event_attendees(email)',

    // Calendar event reminders indexes
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_event_id ON calendar_event_reminders(event_id)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_reminder_type ON calendar_event_reminders(reminder_type)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_reminder_time ON calendar_event_reminders(reminder_time)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_sent_at ON calendar_event_reminders(sent_at)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_status ON calendar_event_reminders(status)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_recipient_email ON calendar_event_reminders(recipient_email)',
    'CREATE INDEX IF NOT EXISTS idx_calendar_event_reminders_recipient_phone ON calendar_event_reminders(recipient_phone)',

    // Court dates indexes
    'CREATE INDEX IF NOT EXISTS idx_court_dates_case_id ON court_dates(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_court_dates_scheduled_date ON court_dates(scheduled_date)',
    'CREATE INDEX IF NOT EXISTS idx_court_dates_status ON court_dates(status)',
    'CREATE INDEX IF NOT EXISTS idx_court_dates_assigned_to ON court_dates(assigned_to)',
    'CREATE INDEX IF NOT EXISTS idx_court_dates_created_by ON court_dates(created_by)',

    // Internal messages indexes
    'CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id)',
    'CREATE INDEX IF NOT EXISTS idx_internal_messages_message_type ON internal_messages(message_type)',
    'CREATE INDEX IF NOT EXISTS idx_internal_messages_priority ON internal_messages(priority)',
    'CREATE INDEX IF NOT EXISTS idx_internal_messages_is_urgent ON internal_messages(is_urgent)',
    'CREATE INDEX IF NOT EXISTS idx_internal_messages_requires_response ON internal_messages(requires_response)',
    'CREATE INDEX IF NOT EXISTS idx_internal_messages_response_deadline ON internal_messages(response_deadline)',

    // Message recipients indexes
    'CREATE INDEX IF NOT EXISTS idx_message_recipients_message_id ON message_recipients(message_id)',
    'CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_id ON message_recipients(recipient_id)',
    'CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_email ON message_recipients(recipient_email)',
    'CREATE INDEX IF NOT EXISTS idx_message_recipients_read_at ON message_recipients(read_at)',
    'CREATE INDEX IF NOT EXISTS idx_message_recipients_responded_at ON message_recipients(responded_at)',
    'CREATE INDEX IF NOT EXISTS idx_message_recipients_status ON message_recipients(status)',

    // Email templates indexes
    'CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name)',
    'CREATE INDEX IF NOT EXISTS idx_email_templates_template_type ON email_templates(template_type)',
    'CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_email_templates_created_by ON email_templates(created_by)',

    // Email logs indexes
    'CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id)',
    'CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email)',
    'CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status)',
    'CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at)',
    'CREATE INDEX IF NOT EXISTS idx_email_logs_case_id ON email_logs(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_email_logs_client_id ON email_logs(client_id)',

    // SMS logs indexes
    'CREATE INDEX IF NOT EXISTS idx_sms_logs_recipient_phone ON sms_logs(recipient_phone)',
    'CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status)',
    'CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at)',
    'CREATE INDEX IF NOT EXISTS idx_sms_logs_case_id ON sms_logs(case_id)',
    'CREATE INDEX IF NOT EXISTS idx_sms_logs_client_id ON sms_logs(client_id)',

    // Notification preferences indexes
    'CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_notification_preferences_notification_type ON notification_preferences(notification_type)'
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