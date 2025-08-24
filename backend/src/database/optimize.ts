/**
 * Database Optimization Script
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This script optimizes database performance by creating indexes,
 * analyzing query performance, and implementing optimization strategies.
 */

import { DatabaseService } from '@/services/DatabaseService';
import { logger } from '@/utils/logger';

const db = new DatabaseService();

/**
 * Performance optimization indexes for better query performance
 */
const PERFORMANCE_INDEXES = [
  // User performance indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC)`,
  
  // Client performance indexes
  `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email) WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone) WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by) WHERE is_active = true`,
  `CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC)`,
  
  // Case performance indexes
  `CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number) WHERE status != 'deleted'`,
  
  // Document performance indexes
  `CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id) WHERE is_deleted = false`,
  `CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by) WHERE is_deleted = false`,
  `CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type) WHERE is_deleted = false`,
  `CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC) WHERE is_deleted = false`,
  `CREATE INDEX IF NOT EXISTS idx_documents_title_gin ON documents USING gin(to_tsvector('english', title)) WHERE is_deleted = false`,
  
  // Time entry performance indexes
  `CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_time_entries_case_id ON time_entries(case_id)`,
  `CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date)`,
  `CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at DESC)`,
  
  // Invoice performance indexes
  `CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_case_id ON invoices(case_id)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC)`,
  
  // Calendar event performance indexes
  `CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by)`,
  `CREATE INDEX IF NOT EXISTS idx_calendar_events_start_datetime ON calendar_events(start_datetime)`,
  `CREATE INDEX IF NOT EXISTS idx_calendar_events_end_datetime ON calendar_events(end_datetime)`,
  `CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type)`,
  
  // Task performance indexes
  `CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC)`,
  
  // Communication performance indexes
  `CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id)`,
  `CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON internal_messages(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_id ON message_recipients(recipient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_message_recipients_message_id ON message_recipients(message_id)`,
  `CREATE INDEX IF NOT EXISTS idx_message_recipients_status ON message_recipients(status)`,
  
  // Content management performance indexes
  `CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_created_by ON articles(created_by)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_title_gin ON articles USING gin(to_tsvector('english', title))`,
  `CREATE INDEX IF NOT EXISTS idx_articles_content_gin ON articles USING gin(to_tsvector('english', content))`,
  
  // Expenses performance indexes
  `CREATE INDEX IF NOT EXISTS idx_expenses_case_id ON expenses(case_id)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_client_id ON expenses(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_is_approved ON expenses(is_approved)`,
  
  // Audit logs performance indexes
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)`,
  
  // User sessions performance indexes
  `CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token)`,
  `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)`,
  
  // Composite indexes for common query patterns
  `CREATE INDEX IF NOT EXISTS idx_cases_client_status ON cases(client_id, status) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_cases_user_status ON cases(created_by, status) WHERE status != 'deleted'`,
  `CREATE INDEX IF NOT EXISTS idx_documents_case_type ON documents(case_id, file_type) WHERE is_deleted = false`,
  `CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON invoices(client_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start ON calendar_events(created_by, start_datetime)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(assigned_to, status)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_case_approved ON expenses(case_id, is_approved)`
];

/**
 * Full-text search indexes for advanced search functionality
 */
const FULLTEXT_INDEXES = [
  // Full-text search on cases
  `CREATE INDEX IF NOT EXISTS idx_cases_fulltext ON cases USING gin(
    to_tsvector('english', 
      COALESCE(title, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(case_number, '')
    )
  ) WHERE status != 'deleted'`,
  
  // Full-text search on clients
  `CREATE INDEX IF NOT EXISTS idx_clients_fulltext ON clients USING gin(
    to_tsvector('english', 
      COALESCE(first_name, '') || ' ' || 
      COALESCE(last_name, '') || ' ' || 
      COALESCE(email, '') || ' ' || 
      COALESCE(phone, '') || ' ' || 
      COALESCE(company_name, '')
    )
  ) WHERE is_active = true`,
  
  // Full-text search on documents
  `CREATE INDEX IF NOT EXISTS idx_documents_fulltext ON documents USING gin(
    to_tsvector('english', 
      COALESCE(title, '') || ' ' || 
      COALESCE(description, '') || ' ' || 
      COALESCE(file_name, '')
    )
  ) WHERE is_deleted = false`,
  
  // Full-text search on articles
  `CREATE INDEX IF NOT EXISTS idx_articles_fulltext ON articles USING gin(
    to_tsvector('english', 
      COALESCE(title, '') || ' ' || 
      COALESCE(content, '') || ' ' || 
      COALESCE(excerpt, '')
    )
  ) WHERE status = 'published'`
];

/**
 * Partitioning for large tables
 */
const PARTITIONING_QUERIES = [
  // Partition audit_logs by month
  `CREATE TABLE IF NOT EXISTS audit_logs_partitioned (
    LIKE audit_logs INCLUDING ALL
  ) PARTITION BY RANGE (created_at)`,
  
  // Partition time_entries by month
  `CREATE TABLE IF NOT EXISTS time_entries_partitioned (
    LIKE time_entries INCLUDING ALL
  ) PARTITION BY RANGE (date)`,
  
  // Partition documents by year
  `CREATE TABLE IF NOT EXISTS documents_partitioned (
    LIKE documents INCLUDING ALL
  ) PARTITION BY RANGE (created_at)`
];

/**
 * Database optimization functions
 */
const OPTIMIZATION_FUNCTIONS = [
  // Function to update table statistics
  `CREATE OR REPLACE FUNCTION update_table_statistics()
  RETURNS void AS $$
  BEGIN
    ANALYZE users;
    ANALYZE clients;
    ANALYZE cases;
    ANALYZE documents;
    ANALYZE time_entries;
    ANALYZE invoices;
    ANALYZE calendar_events;
    ANALYZE tasks;
    ANALYZE internal_messages;
    ANALYZE articles;
    ANALYZE expenses;
    ANALYZE audit_logs;
  END;
  $$ LANGUAGE plpgsql`,
  
  // Function to clean up old audit logs
  `CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(months_to_keep INTEGER DEFAULT 12)
  RETURNS INTEGER AS $$
  DECLARE
    deleted_count INTEGER;
  BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 month' * months_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
  END;
  $$ LANGUAGE plpgsql`,
  
  // Function to optimize database
  `CREATE OR REPLACE FUNCTION optimize_database()
  RETURNS void AS $$
  BEGIN
    -- Update statistics
    PERFORM update_table_statistics();
    
    -- Clean up old audit logs (keep 12 months)
    PERFORM cleanup_old_audit_logs(12);
    
    -- Vacuum tables
    VACUUM ANALYZE users;
    VACUUM ANALYZE clients;
    VACUUM ANALYZE cases;
    VACUUM ANALYZE documents;
    VACUUM ANALYZE time_entries;
    VACUUM ANALYZE invoices;
    VACUUM ANALYZE calendar_events;
    VACUUM ANALYZE tasks;
    VACUUM ANALYZE internal_messages;
    VACUUM ANALYZE articles;
    VACUUM ANALYZE expenses;
    VACUUM ANALYZE audit_logs;
  END;
  $$ LANGUAGE plpgsql`
];

/**
 * Create all performance indexes
 */
export async function createPerformanceIndexes(): Promise<void> {
  try {
    logger.info('Creating performance indexes...');
    
    for (const indexQuery of PERFORMANCE_INDEXES) {
      await db.query(indexQuery);
    }
    
    logger.info('Performance indexes created successfully');
  } catch (error) {
    logger.error('Error creating performance indexes:', error as Error);
    throw error;
  }
}

/**
 * Create full-text search indexes
 */
export async function createFulltextIndexes(): Promise<void> {
  try {
    logger.info('Creating full-text search indexes...');
    
    for (const indexQuery of FULLTEXT_INDEXES) {
      await db.query(indexQuery);
    }
    
    logger.info('Full-text search indexes created successfully');
  } catch (error) {
    logger.error('Error creating full-text search indexes:', error as Error);
    throw error;
  }
}

/**
 * Create optimization functions
 */
export async function createOptimizationFunctions(): Promise<void> {
  try {
    logger.info('Creating optimization functions...');
    
    for (const functionQuery of OPTIMIZATION_FUNCTIONS) {
      await db.query(functionQuery);
    }
    
    logger.info('Optimization functions created successfully');
  } catch (error) {
    logger.error('Error creating optimization functions:', error as Error);
    throw error;
  }
}

/**
 * Run database optimization
 */
export async function optimizeDatabase(): Promise<void> {
  try {
    logger.info('Running database optimization...');
    
    // Create all indexes and functions
    await createPerformanceIndexes();
    await createFulltextIndexes();
    await createOptimizationFunctions();
    
    // Run optimization function
    await db.query('SELECT optimize_database()');
    
    logger.info('Database optimization completed successfully');
  } catch (error) {
    logger.error('Error optimizing database:', error as Error);
    throw error;
  }
}

/**
 * Analyze query performance
 */
export async function analyzeQueryPerformance(): Promise<any> {
  try {
    logger.info('Analyzing query performance...');
    
    const analysisQueries = [
      // Check index usage
      `SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      ORDER BY idx_scan DESC`,
      
      // Check table statistics
      `SELECT 
        schemaname,
        tablename,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_live_tup,
        n_dead_tup,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC`,
      
      // Check slow queries
      `SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      ORDER BY mean_time DESC 
      LIMIT 20`
    ];
    
    const results = [];
    for (const query of analysisQueries) {
      const result = await db.query(query);
      results.push(result.rows);
    }
    
    logger.info('Query performance analysis completed');
    return results;
  } catch (error) {
    logger.error('Error analyzing query performance:', error as Error);
    throw error;
  }
}

/**
 * Get database performance metrics
 */
export async function getDatabaseMetrics(): Promise<any> {
  try {
    const metrics = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
        (SELECT COUNT(*) FROM clients WHERE is_active = true) as active_clients,
        (SELECT COUNT(*) FROM cases WHERE status != 'deleted') as active_cases,
        (SELECT COUNT(*) FROM documents WHERE is_deleted = false) as total_documents,
        (SELECT COUNT(*) FROM time_entries) as total_time_entries,
        (SELECT COUNT(*) FROM invoices) as total_invoices,
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles,
        (SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours') as audit_logs_24h,
        (SELECT pg_database_size(current_database())) as database_size_bytes
    `);
    
    return metrics.rows[0];
  } catch (error) {
    logger.error('Error getting database metrics:', error as Error);
    throw error;
  }
}

export default {
  createPerformanceIndexes,
  createFulltextIndexes,
  createOptimizationFunctions,
  optimizeDatabase,
  analyzeQueryPerformance,
  getDatabaseMetrics
};