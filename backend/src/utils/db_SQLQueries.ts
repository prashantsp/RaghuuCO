/**
 * Centralized Database SQL Queries
 * All SQL queries for the RAGHUU CO Legal Practice Management System
 * This file contains all database queries to ensure consistency and maintainability
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This module centralizes all SQL queries used throughout the application.
 * It provides a single source of truth for database operations, making it easier to
 * maintain, optimize, and audit database interactions.
 * 
 * @example
 * ```typescript
 * import SQLQueries from '@/utils/db_SQLQueries';
 * 
 * // Use a query
 * const users = await db.query(SQLQueries.USERS.GET_ALL_USERS);
 * ```
 */

/**
 * Centralized SQL queries object containing all database operations
 * Organized by entity type for easy maintenance and access
 */
export const SQLQueries = {
  /**
   * User Management Queries
   * Contains all SQL operations related to user management including
   * creation, retrieval, updates, and deletion of user accounts
   */
  USERS: {
    CREATE_USER: `
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    
    GET_USER_BY_ID: `
      SELECT * FROM users WHERE id = $1 AND is_active = true
    `,
    
    GET_USER_BY_EMAIL: `
      SELECT * FROM users WHERE email = $1 AND is_active = true
    `,
    
    GET_ALL_USERS: `
      SELECT id, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
    `,
    
    GET_USERS_WITH_PAGINATION: `
      SELECT id, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `,
    
    GET_USERS_BY_ROLE: `
      SELECT id, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at
      FROM users
      WHERE role = $1 AND is_active = true
      ORDER BY created_at DESC
    `,
    
    SEARCH_USERS: `
      SELECT id, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at
      FROM users
      WHERE is_active = true
      AND (
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        LOWER(email) LIKE LOWER($1)
      )
      ORDER BY created_at DESC
    `,
    
    UPDATE_USER: `
      UPDATE users
      SET first_name = $2, last_name = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `,
    
    UPDATE_USER_ROLE: `
      UPDATE users
      SET role = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `,
    
    UPDATE_USER_PASSWORD: `
      UPDATE users
      SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `,
    
    UPDATE_LAST_LOGIN: `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    
    DEACTIVATE_USER: `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    
    GET_USERS_COUNT: `
      SELECT COUNT(*) as count FROM users WHERE is_active = true
    `
  },

  // Social Accounts Queries
  SOCIAL_ACCOUNTS: {
    CREATE_SOCIAL_ACCOUNT: `
      INSERT INTO social_accounts (user_id, provider, provider_user_id, access_token, refresh_token, expires_at, profile_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    
    GET_SOCIAL_ACCOUNT: `
      SELECT * FROM social_accounts WHERE provider = $1 AND provider_user_id = $2
    `,
    
    GET_SOCIAL_ACCOUNTS_BY_USER: `
      SELECT * FROM social_accounts WHERE user_id = $1
    `,
    
    UPDATE_SOCIAL_ACCOUNT: `
      UPDATE social_accounts
      SET access_token = $3, refresh_token = $4, expires_at = $5, profile_data = $6, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND provider = $2
      RETURNING *
    `,
    
    DELETE_SOCIAL_ACCOUNT: `
      DELETE FROM social_accounts WHERE user_id = $1 AND provider = $2
    `
  },

  // Client Management Queries
  CLIENTS: {
    CREATE_CLIENT: `
      INSERT INTO clients (client_type, first_name, last_name, company_name, email, phone, address, pan_number, gstin, emergency_contact, referral_source, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
    
    GET_CLIENT_BY_ID: `
      SELECT * FROM clients WHERE id = $1 AND is_active = true
    `,
    
    GET_CLIENT_BY_EMAIL: `
      SELECT * FROM clients WHERE email = $1 AND is_active = true
    `,
    
    GET_ALL_CLIENTS: `
      SELECT * FROM clients WHERE is_active = true ORDER BY created_at DESC
    `,
    
    GET_CLIENTS_WITH_PAGINATION: `
      SELECT * FROM clients 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `,
    
    GET_CLIENTS_BY_TYPE: `
      SELECT * FROM clients 
      WHERE client_type = $1 AND is_active = true 
      ORDER BY created_at DESC
    `,
    
    SEARCH_CLIENTS: `
      SELECT * FROM clients
      WHERE is_active = true
      AND (
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        LOWER(company_name) LIKE LOWER($1) OR
        LOWER(email) LIKE LOWER($1)
      )
      ORDER BY created_at DESC
    `,
    
    UPDATE_CLIENT: `
      UPDATE clients
      SET first_name = $2, last_name = $3, company_name = $4, email = $5, phone = $6, 
          address = $7, pan_number = $8, gstin = $9, emergency_contact = $10, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `,
    
    DEACTIVATE_CLIENT: `
      UPDATE clients
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    
    GET_CLIENTS_COUNT: `
      SELECT COUNT(*) as count FROM clients WHERE is_active = true
    `,
    
    CHECK_CLIENT_CONFLICT: `
      SELECT * FROM clients
      WHERE (
        (email = $1 AND email IS NOT NULL) OR
        (phone = $2 AND phone IS NOT NULL) OR
        (pan_number = $3 AND pan_number IS NOT NULL)
      )
      AND is_active = true
      AND id != $4
    `
  },

  // Case Management Queries
  CASES: {
    CREATE_CASE: `
      INSERT INTO cases (case_number, title, case_type, status, priority, description, client_id, assigned_partner, assigned_associates, court_details, opposing_party, case_value, retainer_amount, billing_arrangement, start_date, expected_completion_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `,
    
    GET_CASE_BY_ID: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE c.id = $1
    `,
    
    GET_CASE_BY_NUMBER: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE c.case_number = $1
    `,
    
    GET_ALL_CASES: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      ORDER BY c.created_at DESC
    `,
    
    GET_CASES_WITH_PAGINATION: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `,
    
    GET_CASES_BY_STATUS: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE c.status = $1
      ORDER BY c.created_at DESC
    `,
    
    GET_CASES_BY_TYPE: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE c.case_type = $1
      ORDER BY c.created_at DESC
    `,
    
    GET_CASES_BY_CLIENT: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE c.client_id = $1
      ORDER BY c.created_at DESC
    `,
    
    GET_CASES_BY_PARTNER: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE c.assigned_partner = $1
      ORDER BY c.created_at DESC
    `,
    
    SEARCH_CASES: `
      SELECT c.*, 
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.company_name as client_company,
             u.first_name as partner_first_name, u.last_name as partner_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_partner = u.id
      WHERE (
        LOWER(c.title) LIKE LOWER($1) OR
        LOWER(c.case_number) LIKE LOWER($1) OR
        LOWER(c.description) LIKE LOWER($1) OR
        LOWER(cl.first_name) LIKE LOWER($1) OR
        LOWER(cl.last_name) LIKE LOWER($1) OR
        LOWER(cl.company_name) LIKE LOWER($1)
      )
      ORDER BY c.created_at DESC
    `,
    
    UPDATE_CASE: `
      UPDATE cases
      SET title = $2, case_type = $3, status = $4, priority = $5, description = $6,
          assigned_partner = $7, assigned_associates = $8, court_details = $9, opposing_party = $10,
          case_value = $11, retainer_amount = $12, billing_arrangement = $13, expected_completion_date = $14,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    
    UPDATE_CASE_STATUS: `
      UPDATE cases
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    
    COMPLETE_CASE: `
      UPDATE cases
      SET status = 'completed', actual_completion_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    
    GET_CASES_COUNT: `
      SELECT COUNT(*) as count FROM cases
    `,
    
    GET_CASES_COUNT_BY_STATUS: `
      SELECT status, COUNT(*) as count 
      FROM cases 
      GROUP BY status
    `,
    
    GET_CASES_COUNT_BY_TYPE: `
      SELECT case_type, COUNT(*) as count 
      FROM cases 
      GROUP BY case_type
    `,
    
    GENERATE_CASE_NUMBER: `
      SELECT 'CASE-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(COALESCE(MAX(SUBSTRING(case_number FROM 10)::integer), 0) + 1::text, 3, '0') as next_case_number
      FROM cases
      WHERE case_number LIKE 'CASE-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%'
    `
  },

  // Document Management Queries
  DOCUMENTS: {
    CREATE_DOCUMENT: `
      INSERT INTO documents (case_id, filename, original_filename, file_path, file_size, mime_type, document_type, version, parent_document_id, tags, description, is_confidential, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    
    GET_DOCUMENT_BY_ID: `
      SELECT d.*, 
             u.first_name as uploader_first_name, u.last_name as uploader_last_name,
             c.case_number, c.title as case_title
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE d.id = $1
    `,
    
    GET_DOCUMENTS_BY_CASE: `
      SELECT d.*, 
             u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = $1
      ORDER BY d.created_at DESC
    `,
    
    GET_DOCUMENTS_BY_TYPE: `
      SELECT d.*, 
             u.first_name as uploader_first_name, u.last_name as uploader_last_name,
             c.case_number, c.title as case_title
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE d.document_type = $1
      ORDER BY d.created_at DESC
    `,
    
    SEARCH_DOCUMENTS: `
      SELECT d.*, 
             u.first_name as uploader_first_name, u.last_name as uploader_last_name,
             c.case_number, c.title as case_title
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE (
        LOWER(d.original_filename) LIKE LOWER($1) OR
        LOWER(d.description) LIKE LOWER($1) OR
        LOWER(c.title) LIKE LOWER($1) OR
        LOWER(c.case_number) LIKE LOWER($1)
      )
      ORDER BY d.created_at DESC
    `,
    
    UPDATE_DOCUMENT: `
      UPDATE documents
      SET description = $2, tags = $3, is_confidential = $4
      WHERE id = $1
      RETURNING *
    `,
    
    DELETE_DOCUMENT: `
      DELETE FROM documents WHERE id = $1
    `,
    
    GET_DOCUMENT_VERSIONS: `
      SELECT * FROM documents
      WHERE parent_document_id = $1 OR id = $1
      ORDER BY version DESC
    `,
    
    GET_DOCUMENTS_COUNT: `
      SELECT COUNT(*) as count FROM documents
    `,
    
    GET_DOCUMENTS_COUNT_BY_TYPE: `
      SELECT document_type, COUNT(*) as count 
      FROM documents 
      GROUP BY document_type
    `
  },

  // Time Tracking Queries
  TIME_ENTRIES: {
    CREATE_TIME_ENTRY: `
      INSERT INTO time_entries (case_id, user_id, task_description, hours_worked, billing_rate, is_billable, date_worked)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    
    GET_TIME_ENTRY_BY_ID: `
      SELECT te.*, 
             u.first_name as user_first_name, u.last_name as user_last_name,
             c.case_number, c.title as case_title
      FROM time_entries te
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN cases c ON te.case_id = c.id
      WHERE te.id = $1
    `,
    
    GET_TIME_ENTRIES_BY_CASE: `
      SELECT te.*, 
             u.first_name as user_first_name, u.last_name as user_last_name
      FROM time_entries te
      LEFT JOIN users u ON te.user_id = u.id
      WHERE te.case_id = $1
      ORDER BY te.date_worked DESC, te.created_at DESC
    `,
    
    GET_TIME_ENTRIES_BY_USER: `
      SELECT te.*, 
             c.case_number, c.title as case_title
      FROM time_entries te
      LEFT JOIN cases c ON te.case_id = c.id
      WHERE te.user_id = $1
      ORDER BY te.date_worked DESC, te.created_at DESC
    `,
    
    GET_TIME_ENTRIES_BY_DATE_RANGE: `
      SELECT te.*, 
             u.first_name as user_first_name, u.last_name as user_last_name,
             c.case_number, c.title as case_title
      FROM time_entries te
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN cases c ON te.case_id = c.id
      WHERE te.date_worked BETWEEN $1 AND $2
      ORDER BY te.date_worked DESC, te.created_at DESC
    `,
    
    UPDATE_TIME_ENTRY: `
      UPDATE time_entries
      SET task_description = $2, hours_worked = $3, billing_rate = $4, is_billable = $5
      WHERE id = $1
      RETURNING *
    `,
    
    DELETE_TIME_ENTRY: `
      DELETE FROM time_entries WHERE id = $1
    `,
    
    GET_TIME_ENTRIES_COUNT: `
      SELECT COUNT(*) as count FROM time_entries
    `,
    
    GET_TOTAL_HOURS_BY_CASE: `
      SELECT case_id, SUM(hours_worked) as total_hours
      FROM time_entries
      WHERE case_id = $1
      GROUP BY case_id
    `,
    
    GET_TOTAL_HOURS_BY_USER: `
      SELECT user_id, SUM(hours_worked) as total_hours
      FROM time_entries
      WHERE user_id = $1 AND date_worked BETWEEN $2 AND $3
      GROUP BY user_id
    `
  },

  // Audit Logs Queries
  AUDIT_LOGS: {
    CREATE_AUDIT_LOG: `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
    
    GET_AUDIT_LOGS_BY_USER: `
      SELECT * FROM audit_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    
    GET_AUDIT_LOGS_BY_RESOURCE: `
      SELECT * FROM audit_logs
      WHERE resource_type = $1 AND resource_id = $2
      ORDER BY created_at DESC
    `,
    
    GET_AUDIT_LOGS_BY_ACTION: `
      SELECT * FROM audit_logs
      WHERE action = $1
      ORDER BY created_at DESC
    `,
    
    GET_AUDIT_LOGS_WITH_PAGINATION: `
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `,
    
    GET_AUDIT_LOGS_BY_DATE_RANGE: `
      SELECT * FROM audit_logs
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
    `,
    
    GET_AUDIT_LOGS_COUNT: `
      SELECT COUNT(*) as count FROM audit_logs
    `
  },

  // User Sessions Queries
  USER_SESSIONS: {
    CREATE: `
      INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_TOKEN: `
      SELECT * FROM user_sessions WHERE session_token = $1 AND is_active = true AND expires_at > NOW()
    `,
    GET_BY_USER_ID: `
      SELECT * FROM user_sessions WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC
    `,
    UPDATE: `
      UPDATE user_sessions SET is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM user_sessions WHERE id = $1
    `,
    DELETE_EXPIRED: `
      DELETE FROM user_sessions WHERE expires_at < NOW()
    `
  },

  BILLING_RATES: {
    CREATE: `
      INSERT INTO billing_rates (user_id, case_type, hourly_rate, is_default, effective_date, end_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    GET_BY_USER_ID: `
      SELECT * FROM billing_rates WHERE user_id = $1 ORDER BY effective_date DESC
    `,
    GET_DEFAULT_RATE: `
      SELECT * FROM billing_rates WHERE user_id = $1 AND is_default = true AND (end_date IS NULL OR end_date > NOW())
      ORDER BY effective_date DESC LIMIT 1
    `,
    GET_RATE_BY_CASE_TYPE: `
      SELECT * FROM billing_rates WHERE user_id = $1 AND case_type = $2 AND (end_date IS NULL OR end_date > NOW())
      ORDER BY effective_date DESC LIMIT 1
    `,
    UPDATE: `
      UPDATE billing_rates SET hourly_rate = $2, is_default = $3, end_date = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM billing_rates WHERE id = $1
    `,
    SEARCH: `
      SELECT br.*, u.first_name, u.last_name, u.email
      FROM billing_rates br
      JOIN users u ON br.user_id = u.id
      WHERE ($1::text IS NULL OR u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)
      AND ($2::case_type_enum IS NULL OR br.case_type = $2)
      ORDER BY br.effective_date DESC
      LIMIT $3 OFFSET $4
    `
  },

  INVOICES: {
    CREATE: `
      INSERT INTO invoices (invoice_number, case_id, client_id, user_id, status, subtotal, tax_amount, total_amount, 
                           currency, due_date, issued_date, notes, terms_conditions, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT i.*, c.case_number, c.title as case_title, cl.first_name as client_first_name, 
             cl.last_name as client_last_name, u.first_name as user_first_name, u.last_name as user_last_name
      FROM invoices i
      JOIN cases c ON i.case_id = c.id
      JOIN clients cl ON i.client_id = cl.id
      JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `,
    GET_BY_CASE_ID: `
      SELECT * FROM invoices WHERE case_id = $1 ORDER BY created_at DESC
    `,
    GET_BY_CLIENT_ID: `
      SELECT * FROM invoices WHERE client_id = $1 ORDER BY created_at DESC
    `,
    GET_BY_USER_ID: `
      SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC
    `,
    UPDATE: `
      UPDATE invoices SET status = $2, subtotal = $3, tax_amount = $4, total_amount = $5, 
                         due_date = $6, issued_date = $7, paid_date = $8, payment_method = $9,
                         notes = $10, terms_conditions = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM invoices WHERE id = $1
    `,
    SEARCH: `
      SELECT i.*, c.case_number, c.title as case_title, cl.first_name as client_first_name, 
             cl.last_name as client_last_name, u.first_name as user_first_name, u.last_name as user_last_name
      FROM invoices i
      JOIN cases c ON i.case_id = c.id
      JOIN clients cl ON i.client_id = cl.id
      JOIN users u ON i.user_id = u.id
      WHERE ($1::text IS NULL OR i.invoice_number ILIKE $1 OR c.case_number ILIKE $1)
      AND ($2::invoice_status_enum IS NULL OR i.status = $2)
      AND ($3::uuid IS NULL OR i.client_id = $3)
      AND ($4::uuid IS NULL OR i.user_id = $4)
      ORDER BY i.created_at DESC
      LIMIT $5 OFFSET $6
    `,
    GET_STATS: `
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_invoices,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_invoices,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status IN ('sent', 'overdue') THEN total_amount ELSE 0 END) as total_outstanding
      FROM invoices
      WHERE ($1::uuid IS NULL OR user_id = $1)
      AND ($2::uuid IS NULL OR client_id = $2)
    `,
    GENERATE_INVOICE_NUMBER: `
      SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
             LPAD(COALESCE(MAX(SUBSTRING(invoice_number FROM 16)), '0')::integer + 1, 4, '0') as next_number
      FROM invoices 
      WHERE invoice_number LIKE 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%'
    `
  },

  INVOICE_ITEMS: {
    CREATE: `
      INSERT INTO invoice_items (invoice_id, time_entry_id, description, quantity, unit_rate, amount, item_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    GET_BY_INVOICE_ID: `
      SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at
    `,
    UPDATE: `
      UPDATE invoice_items SET description = $2, quantity = $3, unit_rate = $4, amount = $5, item_type = $6
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM invoice_items WHERE id = $1
    `,
    DELETE_BY_INVOICE_ID: `
      DELETE FROM invoice_items WHERE invoice_id = $1
    `
  },

  PAYMENTS: {
    CREATE: `
      INSERT INTO payments (invoice_id, payment_number, amount, payment_date, payment_method, 
                           transaction_id, status, gateway_response, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT p.*, i.invoice_number, i.total_amount as invoice_total
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE p.id = $1
    `,
    GET_BY_INVOICE_ID: `
      SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC
    `,
    UPDATE: `
      UPDATE payments SET amount = $2, payment_date = $3, payment_method = $4, transaction_id = $5,
                         status = $6, gateway_response = $7, notes = $8
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM payments WHERE id = $1
    `,
    SEARCH: `
      SELECT p.*, i.invoice_number, i.total_amount as invoice_total
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE ($1::text IS NULL OR p.payment_number ILIKE $1 OR i.invoice_number ILIKE $1)
      AND ($2::payment_status_enum IS NULL OR p.status = $2)
      AND ($3::payment_method_enum IS NULL OR p.payment_method = $3)
      ORDER BY p.payment_date DESC
      LIMIT $4 OFFSET $5
    `,
    GET_STATS: `
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_received,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending
      FROM payments
      WHERE ($1::uuid IS NULL OR created_by = $1)
      AND payment_date >= $2 AND payment_date <= $3
    `,
    GENERATE_PAYMENT_NUMBER: `
      SELECT 'PAY-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
             LPAD(COALESCE(MAX(SUBSTRING(payment_number FROM 16)), '0')::integer + 1, 4, '0') as next_number
      FROM payments 
      WHERE payment_number LIKE 'PAY-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-%'
    `
  },

  CALENDAR_EVENTS: {
    CREATE: `
      INSERT INTO calendar_events (title, description, event_type, start_datetime, end_datetime, all_day, 
                                  location, case_id, client_id, assigned_to, created_by, status, priority, 
                                  reminder_minutes, external_calendar_id, external_calendar_provider)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT ce.*, c.case_number, c.title as case_title, cl.first_name as client_first_name, 
             cl.last_name as client_last_name, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.assigned_to = u.id
      WHERE ce.id = $1
    `,
    GET_BY_USER_ID: `
      SELECT * FROM calendar_events WHERE assigned_to = $1 ORDER BY start_datetime
    `,
    GET_BY_CASE_ID: `
      SELECT * FROM calendar_events WHERE case_id = $1 ORDER BY start_datetime
    `,
    GET_BY_CLIENT_ID: `
      SELECT * FROM calendar_events WHERE client_id = $1 ORDER BY start_datetime
    `,
    GET_BY_DATE_RANGE: `
      SELECT ce.*, c.case_number, c.title as case_title, cl.first_name as client_first_name, 
             cl.last_name as client_last_name, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.assigned_to = u.id
      WHERE ce.start_datetime >= $1 AND ce.start_datetime <= $2
      AND ($3::uuid IS NULL OR ce.assigned_to = $3)
      ORDER BY ce.start_datetime
    `,
    UPDATE: `
      UPDATE calendar_events SET title = $2, description = $3, event_type = $4, start_datetime = $5, 
                                end_datetime = $6, all_day = $7, location = $8, case_id = $9, client_id = $10,
                                assigned_to = $11, status = $12, priority = $13, reminder_minutes = $14,
                                external_calendar_id = $15, external_calendar_provider = $16, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM calendar_events WHERE id = $1
    `,
    SEARCH: `
      SELECT ce.*, c.case_number, c.title as case_title, cl.first_name as client_first_name, 
             cl.last_name as client_last_name, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.assigned_to = u.id
      WHERE ($1::text IS NULL OR ce.title ILIKE $1 OR ce.description ILIKE $1)
      AND ($2::calendar_event_type_enum IS NULL OR ce.event_type = $2)
      AND ($3::calendar_event_status_enum IS NULL OR ce.status = $3)
      AND ($4::uuid IS NULL OR ce.assigned_to = $4)
      AND ($5::uuid IS NULL OR ce.case_id = $5)
      AND ($6::uuid IS NULL OR ce.client_id = $6)
      ORDER BY ce.start_datetime DESC
      LIMIT $7 OFFSET $8
    `,
    GET_CONFLICTS: `
      SELECT * FROM calendar_events 
      WHERE assigned_to = $1 
      AND status = 'scheduled'
      AND (
        (start_datetime <= $2 AND end_datetime > $2) OR
        (start_datetime < $3 AND end_datetime >= $3) OR
        (start_datetime >= $2 AND end_datetime <= $3)
      )
      AND id != $4
    `,
    GET_UPCOMING: `
      SELECT ce.*, c.case_number, c.title as case_title, cl.first_name as client_first_name, 
             cl.last_name as client_last_name, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM calendar_events ce
      LEFT JOIN cases c ON ce.case_id = c.id
      LEFT JOIN clients cl ON ce.client_id = cl.id
      LEFT JOIN users u ON ce.assigned_to = u.id
      WHERE ce.start_datetime >= NOW() 
      AND ce.status = 'scheduled'
      AND ($1::uuid IS NULL OR ce.assigned_to = $1)
      ORDER BY ce.start_datetime
      LIMIT $2
    `
  },

  CALENDAR_EVENT_ATTENDEES: {
    CREATE: `
      INSERT INTO calendar_event_attendees (event_id, user_id, client_id, email, name, response_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_EVENT_ID: `
      SELECT cea.*, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
             cl.first_name as client_first_name, cl.last_name as client_last_name, cl.email as client_email
      FROM calendar_event_attendees cea
      LEFT JOIN users u ON cea.user_id = u.id
      LEFT JOIN clients cl ON cea.client_id = cl.id
      WHERE cea.event_id = $1
      ORDER BY cea.created_at
    `,
    UPDATE_RESPONSE: `
      UPDATE calendar_event_attendees SET response_status = $2, response_date = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM calendar_event_attendees WHERE id = $1
    `,
    DELETE_BY_EVENT_ID: `
      DELETE FROM calendar_event_attendees WHERE event_id = $1
    `
  },

  CALENDAR_EVENT_REMINDERS: {
    CREATE: `
      INSERT INTO calendar_event_reminders (event_id, reminder_type, reminder_time, recipient_email, 
                                           recipient_phone, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_EVENT_ID: `
      SELECT * FROM calendar_event_reminders WHERE event_id = $1 ORDER BY reminder_time
    `,
    GET_PENDING: `
      SELECT cer.*, ce.title as event_title, ce.start_datetime, ce.end_datetime
      FROM calendar_event_reminders cer
      JOIN calendar_events ce ON cer.event_id = ce.id
      WHERE cer.status = 'pending' AND cer.reminder_time <= NOW()
      ORDER BY cer.reminder_time
    `,
    UPDATE_STATUS: `
      UPDATE calendar_event_reminders SET status = $2, sent_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM calendar_event_reminders WHERE id = $1
    `,
    DELETE_BY_EVENT_ID: `
      DELETE FROM calendar_event_reminders WHERE event_id = $1
    `
  },

  COURT_DATES: {
    CREATE: `
      INSERT INTO court_dates (case_id, court_name, court_address, case_number, hearing_type, 
                              scheduled_date, duration_minutes, judge_name, opposing_counsel, notes, 
                              assigned_to, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT cd.*, c.case_number, c.title as case_title, u.first_name as assigned_first_name, 
             u.last_name as assigned_last_name
      FROM court_dates cd
      JOIN cases c ON cd.case_id = c.id
      LEFT JOIN users u ON cd.assigned_to = u.id
      WHERE cd.id = $1
    `,
    GET_BY_CASE_ID: `
      SELECT * FROM court_dates WHERE case_id = $1 ORDER BY scheduled_date
    `,
    GET_BY_USER_ID: `
      SELECT cd.*, c.case_number, c.title as case_title
      FROM court_dates cd
      JOIN cases c ON cd.case_id = c.id
      WHERE cd.assigned_to = $1 ORDER BY cd.scheduled_date
    `,
    UPDATE: `
      UPDATE court_dates SET court_name = $2, court_address = $3, case_number = $4, hearing_type = $5,
                            scheduled_date = $6, duration_minutes = $7, judge_name = $8, opposing_counsel = $9,
                            notes = $10, status = $11, assigned_to = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM court_dates WHERE id = $1
    `,
    SEARCH: `
      SELECT cd.*, c.case_number, c.title as case_title, u.first_name as assigned_first_name, 
             u.last_name as assigned_last_name
      FROM court_dates cd
      JOIN cases c ON cd.case_id = c.id
      LEFT JOIN users u ON cd.assigned_to = u.id
      WHERE ($1::text IS NULL OR cd.court_name ILIKE $1 OR cd.case_number ILIKE $1)
      AND ($2::court_hearing_type_enum IS NULL OR cd.hearing_type = $2)
      AND ($3::court_date_status_enum IS NULL OR cd.status = $3)
      AND ($4::uuid IS NULL OR cd.assigned_to = $4)
      AND ($5::uuid IS NULL OR cd.case_id = $5)
      ORDER BY cd.scheduled_date DESC
      LIMIT $6 OFFSET $7
    `,
    GET_UPCOMING: `
      SELECT cd.*, c.case_number, c.title as case_title, u.first_name as assigned_first_name, 
             u.last_name as assigned_last_name
      FROM court_dates cd
      JOIN cases c ON cd.case_id = c.id
      LEFT JOIN users u ON cd.assigned_to = u.id
      WHERE cd.scheduled_date >= NOW() 
      AND cd.status = 'scheduled'
      AND ($1::uuid IS NULL OR cd.assigned_to = $1)
      ORDER BY cd.scheduled_date
      LIMIT $2
    `
  },

  INTERNAL_MESSAGES: {
    CREATE: `
      INSERT INTO internal_messages (subject, content, sender_id, message_type, priority, is_urgent, 
                                    requires_response, response_deadline)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT im.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
      FROM internal_messages im
      JOIN users u ON im.sender_id = u.id
      WHERE im.id = $1
    `,
    GET_BY_SENDER_ID: `
      SELECT * FROM internal_messages WHERE sender_id = $1 ORDER BY created_at DESC
    `,
    UPDATE: `
      UPDATE internal_messages SET subject = $2, content = $3, message_type = $4, priority = $5, 
                                 is_urgent = $6, requires_response = $7, response_deadline = $8
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM internal_messages WHERE id = $1
    `,
    SEARCH: `
      SELECT im.*, u.first_name as sender_first_name, u.last_name as sender_last_name, u.email as sender_email
      FROM internal_messages im
      JOIN users u ON im.sender_id = u.id
      WHERE ($1::text IS NULL OR im.subject ILIKE $1 OR im.content ILIKE $1)
      AND ($2::internal_message_type_enum IS NULL OR im.message_type = $2)
      AND ($3::internal_message_priority_enum IS NULL OR im.priority = $3)
      AND ($4::uuid IS NULL OR im.sender_id = $4)
      AND ($5::boolean IS NULL OR im.is_urgent = $5)
      ORDER BY im.created_at DESC
      LIMIT $6 OFFSET $7
    `
  },

  MESSAGE_RECIPIENTS: {
    CREATE: `
      INSERT INTO message_recipients (message_id, recipient_id, recipient_email, recipient_name, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    GET_BY_MESSAGE_ID: `
      SELECT mr.*, u.first_name as recipient_first_name, u.last_name as recipient_last_name, u.email as recipient_email
      FROM message_recipients mr
      LEFT JOIN users u ON mr.recipient_id = u.id
      WHERE mr.message_id = $1
      ORDER BY mr.created_at
    `,
    GET_BY_RECIPIENT_ID: `
      SELECT mr.*, im.subject, im.content, im.message_type, im.priority, im.is_urgent, im.requires_response,
             im.response_deadline, u.first_name as sender_first_name, u.last_name as sender_last_name
      FROM message_recipients mr
      JOIN internal_messages im ON mr.message_id = im.id
      JOIN users u ON im.sender_id = u.id
      WHERE mr.recipient_id = $1
      ORDER BY mr.created_at DESC
      LIMIT $2 OFFSET $3
    `,
    UPDATE_STATUS: `
      UPDATE message_recipients SET status = $2, read_at = $3, responded_at = $4, response_content = $5
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM message_recipients WHERE id = $1
    `,
    DELETE_BY_MESSAGE_ID: `
      DELETE FROM message_recipients WHERE message_id = $1
    `,
    GET_UNREAD_COUNT: `
      SELECT COUNT(*) as unread_count
      FROM message_recipients
      WHERE recipient_id = $1 AND status = 'unread'
    `
  },

  EMAIL_TEMPLATES: {
    CREATE: `
      INSERT INTO email_templates (name, subject, content, template_type, variables, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT * FROM email_templates WHERE id = $1
    `,
    GET_BY_NAME: `
      SELECT * FROM email_templates WHERE name = $1 AND is_active = true
    `,
    GET_ALL: `
      SELECT * FROM email_templates WHERE is_active = true ORDER BY name
    `,
    UPDATE: `
      UPDATE email_templates SET name = $2, subject = $3, content = $4, template_type = $5, 
                                variables = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM email_templates WHERE id = $1
    `,
    SEARCH: `
      SELECT * FROM email_templates
      WHERE ($1::text IS NULL OR name ILIKE $1 OR subject ILIKE $1)
      AND ($2::email_template_type_enum IS NULL OR template_type = $2)
      AND ($3::boolean IS NULL OR is_active = $3)
      ORDER BY name
      LIMIT $4 OFFSET $5
    `
  },

  EMAIL_LOGS: {
    CREATE: `
      INSERT INTO email_logs (template_id, recipient_email, recipient_name, subject, content, 
                             case_id, client_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT el.*, et.name as template_name
      FROM email_logs el
      LEFT JOIN email_templates et ON el.template_id = et.id
      WHERE el.id = $1
    `,
    GET_BY_RECIPIENT: `
      SELECT * FROM email_logs WHERE recipient_email = $1 ORDER BY created_at DESC
    `,
    GET_BY_CASE_ID: `
      SELECT * FROM email_logs WHERE case_id = $1 ORDER BY created_at DESC
    `,
    GET_BY_CLIENT_ID: `
      SELECT * FROM email_logs WHERE client_id = $1 ORDER BY created_at DESC
    `,
    UPDATE_STATUS: `
      UPDATE email_logs SET status = $2, sent_at = $3, error_message = $4, retry_count = $5
      WHERE id = $1 RETURNING *
    `,
    SEARCH: `
      SELECT el.*, et.name as template_name
      FROM email_logs el
      LEFT JOIN email_templates et ON el.template_id = et.id
      WHERE ($1::text IS NULL OR el.recipient_email ILIKE $1 OR el.subject ILIKE $1)
      AND ($2::email_status_enum IS NULL OR el.status = $2)
      AND ($3::uuid IS NULL OR el.case_id = $3)
      AND ($4::uuid IS NULL OR el.client_id = $4)
      ORDER BY el.created_at DESC
      LIMIT $5 OFFSET $6
    `,
    GET_STATS: `
      SELECT 
        COUNT(*) as total_emails,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_emails,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_emails,
        COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_emails,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked_emails
      FROM email_logs
      WHERE ($1::uuid IS NULL OR case_id = $1)
      AND ($2::uuid IS NULL OR client_id = $2)
      AND created_at >= $3 AND created_at <= $4
    `
  },

  SMS_LOGS: {
    CREATE: `
      INSERT INTO sms_logs (recipient_phone, recipient_name, message, case_id, client_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT * FROM sms_logs WHERE id = $1
    `,
    GET_BY_RECIPIENT: `
      SELECT * FROM sms_logs WHERE recipient_phone = $1 ORDER BY created_at DESC
    `,
    GET_BY_CASE_ID: `
      SELECT * FROM sms_logs WHERE case_id = $1 ORDER BY created_at DESC
    `,
    GET_BY_CLIENT_ID: `
      SELECT * FROM sms_logs WHERE client_id = $1 ORDER BY created_at DESC
    `,
    UPDATE_STATUS: `
      UPDATE sms_logs SET status = $2, sent_at = $3, error_message = $4, retry_count = $5
      WHERE id = $1 RETURNING *
    `,
    SEARCH: `
      SELECT * FROM sms_logs
      WHERE ($1::text IS NULL OR recipient_phone ILIKE $1 OR message ILIKE $1)
      AND ($2::sms_status_enum IS NULL OR status = $2)
      AND ($3::uuid IS NULL OR case_id = $3)
      AND ($4::uuid IS NULL OR client_id = $4)
      ORDER BY created_at DESC
      LIMIT $5 OFFSET $6
    `,
    GET_STATS: `
      SELECT 
        COUNT(*) as total_sms,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_sms,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_sms,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_sms
      FROM sms_logs
      WHERE ($1::uuid IS NULL OR case_id = $1)
      AND ($2::uuid IS NULL OR client_id = $2)
      AND created_at >= $3 AND created_at <= $4
    `
  },

  NOTIFICATION_PREFERENCES: {
    CREATE: `
      INSERT INTO notification_preferences (user_id, notification_type, email_enabled, sms_enabled, 
                                           push_enabled, in_app_enabled)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, notification_type) 
      DO UPDATE SET email_enabled = $3, sms_enabled = $4, push_enabled = $5, in_app_enabled = $6, 
                    updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    GET_BY_USER_ID: `
      SELECT * FROM notification_preferences WHERE user_id = $1
    `,
    GET_BY_USER_AND_TYPE: `
      SELECT * FROM notification_preferences WHERE user_id = $1 AND notification_type = $2
    `,
    UPDATE: `
      UPDATE notification_preferences SET email_enabled = $3, sms_enabled = $4, push_enabled = $5, 
                                         in_app_enabled = $6, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND notification_type = $2 RETURNING *
    `,
    DELETE: `
      DELETE FROM notification_preferences WHERE user_id = $1 AND notification_type = $2
    `,
    DELETE_BY_USER_ID: `
      DELETE FROM notification_preferences WHERE user_id = $1
    `
  },

  REPORTS: {
    CREATE: `
      INSERT INTO reports (name, description, report_type, parameters, schedule_cron, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT r.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM reports r
      JOIN users u ON r.created_by = u.id
      WHERE r.id = $1
    `,
    GET_ALL: `
      SELECT r.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM reports r
      JOIN users u ON r.created_by = u.id
      WHERE r.is_active = true
      ORDER BY r.name
    `,
    UPDATE: `
      UPDATE reports SET name = $2, description = $3, report_type = $4, parameters = $5, 
                        schedule_cron = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM reports WHERE id = $1
    `,
    SEARCH: `
      SELECT r.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM reports r
      JOIN users u ON r.created_by = u.id
      WHERE ($1::text IS NULL OR r.name ILIKE $1 OR r.description ILIKE $1)
      AND ($2::report_type_enum IS NULL OR r.report_type = $2)
      AND ($3::boolean IS NULL OR r.is_active = $3)
      ORDER BY r.name
      LIMIT $4 OFFSET $5
    `
  },

  REPORT_EXECUTIONS: {
    CREATE: `
      INSERT INTO report_executions (report_id, executed_by, status, parameters)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT re.*, r.name as report_name, u.first_name as executed_by_first_name, u.last_name as executed_by_last_name
      FROM report_executions re
      JOIN reports r ON re.report_id = r.id
      LEFT JOIN users u ON re.executed_by = u.id
      WHERE re.id = $1
    `,
    GET_BY_REPORT_ID: `
      SELECT * FROM report_executions WHERE report_id = $1 ORDER BY execution_date DESC
    `,
    UPDATE_STATUS: `
      UPDATE report_executions SET status = $2, result_file_path = $3, error_message = $4, 
                                 execution_time_ms = $5, record_count = $6
      WHERE id = $1 RETURNING *
    `,
    SEARCH: `
      SELECT re.*, r.name as report_name, u.first_name as executed_by_first_name, u.last_name as executed_by_last_name
      FROM report_executions re
      JOIN reports r ON re.report_id = r.id
      LEFT JOIN users u ON re.executed_by = u.id
      WHERE ($1::report_execution_status_enum IS NULL OR re.status = $1)
      AND ($2::uuid IS NULL OR re.executed_by = $2)
      AND ($3::uuid IS NULL OR re.report_id = $3)
      ORDER BY re.execution_date DESC
      LIMIT $4 OFFSET $5
    `
  },

  ANALYTICS_EVENTS: {
    CREATE: `
      INSERT INTO analytics_events (event_type, user_id, session_id, page_url, referrer_url, 
                                   user_agent, ip_address, event_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    GET_BY_USER_ID: `
      SELECT * FROM analytics_events WHERE user_id = $1 ORDER BY created_at DESC
    `,
    GET_BY_SESSION_ID: `
      SELECT * FROM analytics_events WHERE session_id = $1 ORDER BY created_at
    `,
    GET_EVENTS_BY_TYPE: `
      SELECT * FROM analytics_events 
      WHERE event_type = $1 
      AND created_at >= $2 AND created_at <= $3
      ORDER BY created_at DESC
    `,
    GET_PAGE_VIEWS: `
      SELECT page_url, COUNT(*) as view_count
      FROM analytics_events 
      WHERE event_type = 'page_view'
      AND created_at >= $1 AND created_at <= $2
      GROUP BY page_url
      ORDER BY view_count DESC
    `,
    GET_USER_ACTIVITY: `
      SELECT user_id, COUNT(*) as event_count, 
             COUNT(DISTINCT DATE(created_at)) as active_days
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY user_id
      ORDER BY event_count DESC
    `
  },

  PERFORMANCE_METRICS: {
    CREATE: `
      INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    GET_BY_NAME: `
      SELECT * FROM performance_metrics 
      WHERE metric_name = $1 
      AND recorded_at >= $2 AND recorded_at <= $3
      ORDER BY recorded_at
    `,
    GET_AVERAGE_BY_NAME: `
      SELECT AVG(metric_value) as average_value, 
             MIN(metric_value) as min_value, 
             MAX(metric_value) as max_value,
             COUNT(*) as sample_count
      FROM performance_metrics 
      WHERE metric_name = $1 
      AND recorded_at >= $2 AND recorded_at <= $3
    `,
    GET_METRICS_SUMMARY: `
      SELECT metric_name, 
             AVG(metric_value) as average_value,
             COUNT(*) as sample_count
      FROM performance_metrics 
      WHERE recorded_at >= $1 AND recorded_at <= $2
      GROUP BY metric_name
      ORDER BY metric_name
    `
  },

  BUSINESS_METRICS: {
    CREATE: `
      INSERT INTO business_metrics (metric_date, metric_type, metric_value, metric_count, additional_data)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (metric_date, metric_type) 
      DO UPDATE SET metric_value = $3, metric_count = $4, additional_data = $5, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    GET_BY_TYPE: `
      SELECT * FROM business_metrics 
      WHERE metric_type = $1 
      AND metric_date >= $2 AND metric_date <= $3
      ORDER BY metric_date
    `,
    GET_SUMMARY: `
      SELECT metric_type, 
             SUM(metric_value) as total_value,
             AVG(metric_value) as average_value,
             COUNT(*) as data_points
      FROM business_metrics 
      WHERE metric_date >= $1 AND metric_date <= $2
      GROUP BY metric_type
      ORDER BY metric_type
    `,
    GET_DAILY_SUMMARY: `
      SELECT metric_date, 
             SUM(CASE WHEN metric_type = 'revenue' THEN metric_value ELSE 0 END) as daily_revenue,
             SUM(CASE WHEN metric_type = 'expense' THEN metric_value ELSE 0 END) as daily_expense,
             SUM(CASE WHEN metric_type = 'client_count' THEN metric_count ELSE 0 END) as daily_clients,
             SUM(CASE WHEN metric_type = 'case_count' THEN metric_count ELSE 0 END) as daily_cases
      FROM business_metrics 
      WHERE metric_date >= $1 AND metric_date <= $2
      GROUP BY metric_date
      ORDER BY metric_date
    `
  },

  TASKS: {
    CREATE: `
      INSERT INTO tasks (title, description, task_type, status, priority, case_id, client_id, 
                        assigned_to, created_by, estimated_hours, due_date, parent_task_id, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT t.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name, 
             c.case_number, c.title as case_title, cl.name as client_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN cases c ON t.case_id = c.id
      LEFT JOIN clients cl ON t.client_id = cl.id
      WHERE t.id = $1
    `,
    GET_BY_CASE_ID: `
      SELECT t.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.case_id = $1
      ORDER BY t.priority DESC, t.due_date ASC
    `,
    GET_BY_USER_ID: `
      SELECT t.*, c.case_number, c.title as case_title, cl.name as client_name
      FROM tasks t
      LEFT JOIN cases c ON t.case_id = c.id
      LEFT JOIN clients cl ON t.client_id = cl.id
      WHERE t.assigned_to = $1
      ORDER BY t.priority DESC, t.due_date ASC
    `,
    GET_BY_CLIENT_ID: `
      SELECT t.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name,
             c.case_number, c.title as case_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN cases c ON t.case_id = c.id
      WHERE t.client_id = $1
      ORDER BY t.priority DESC, t.due_date ASC
    `,
    UPDATE: `
      UPDATE tasks SET title = $2, description = $3, task_type = $4, status = $5, priority = $6,
                      case_id = $7, client_id = $8, assigned_to = $9, estimated_hours = $10,
                      actual_hours = $11, due_date = $12, completed_date = $13, parent_task_id = $14,
                      tags = $15, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM tasks WHERE id = $1
    `,
    SEARCH: `
      SELECT t.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name,
             c.case_number, c.title as case_title, cl.name as client_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN cases c ON t.case_id = c.id
      LEFT JOIN clients cl ON t.client_id = cl.id
      WHERE ($1::text IS NULL OR t.title ILIKE $1 OR t.description ILIKE $1)
      AND ($2::task_status_enum IS NULL OR t.status = $2)
      AND ($3::task_priority_enum IS NULL OR t.priority = $3)
      AND ($4::task_type_enum IS NULL OR t.task_type = $4)
      AND ($5::uuid IS NULL OR t.assigned_to = $5)
      AND ($6::uuid IS NULL OR t.case_id = $6)
      AND ($7::uuid IS NULL OR t.client_id = $7)
      ORDER BY t.priority DESC, t.due_date ASC
      LIMIT $8 OFFSET $9
    `,
    GET_DEPENDENCIES: `
      SELECT td.*, t.title as depends_on_task_title, t.status as depends_on_task_status
      FROM task_dependencies td
      JOIN tasks t ON td.depends_on_task_id = t.id
      WHERE td.task_id = $1
    `,
    GET_DEPENDENTS: `
      SELECT td.*, t.title as dependent_task_title, t.status as dependent_task_status
      FROM task_dependencies td
      JOIN tasks t ON td.task_id = t.id
      WHERE td.depends_on_task_id = $1
    `,
    GET_STATS: `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks
      FROM tasks
      WHERE ($1::uuid IS NULL OR assigned_to = $1)
      AND ($2::uuid IS NULL OR case_id = $2)
    `
  },

  TASK_DEPENDENCIES: {
    CREATE: `
      INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    DELETE: `
      DELETE FROM task_dependencies WHERE task_id = $1 AND depends_on_task_id = $2
    `,
    DELETE_BY_TASK_ID: `
      DELETE FROM task_dependencies WHERE task_id = $1
    `
  },

  TASK_TIME_ENTRIES: {
    CREATE: `
      INSERT INTO task_time_entries (task_id, user_id, start_time, end_time, duration_minutes, 
                                    description, is_billable, billing_rate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    GET_BY_TASK_ID: `
      SELECT tte.*, u.first_name, u.last_name
      FROM task_time_entries tte
      JOIN users u ON tte.user_id = u.id
      WHERE tte.task_id = $1
      ORDER BY tte.start_time DESC
    `,
    GET_BY_USER_ID: `
      SELECT tte.*, t.title as task_title, c.case_number
      FROM task_time_entries tte
      JOIN tasks t ON tte.task_id = t.id
      LEFT JOIN cases c ON t.case_id = c.id
      WHERE tte.user_id = $1
      ORDER BY tte.start_time DESC
    `,
    UPDATE: `
      UPDATE task_time_entries SET start_time = $2, end_time = $3, duration_minutes = $4,
                                 description = $5, is_billable = $6, billing_rate = $7
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM task_time_entries WHERE id = $1
    `,
    GET_ACTIVE_TIMER: `
      SELECT * FROM task_time_entries 
      WHERE user_id = $1 AND end_time IS NULL
      ORDER BY start_time DESC
      LIMIT 1
    `,
    GET_TIME_SUMMARY: `
      SELECT 
        SUM(duration_minutes) as total_minutes,
        SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END) as billable_minutes,
        COUNT(*) as total_entries
      FROM task_time_entries
      WHERE task_id = $1
    `
  },

  CLIENT_PORTAL_USERS: {
    CREATE: `
      INSERT INTO client_portal_users (client_id, email, password_hash, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT cpu.*, c.name as client_name, c.email as client_email
      FROM client_portal_users cpu
      JOIN clients c ON cpu.client_id = c.id
      WHERE cpu.id = $1
    `,
    GET_BY_EMAIL: `
      SELECT * FROM client_portal_users WHERE email = $1
    `,
    GET_BY_CLIENT_ID: `
      SELECT * FROM client_portal_users WHERE client_id = $1
    `,
    UPDATE: `
      UPDATE client_portal_users SET first_name = $2, last_name = $3, phone = $4, 
                                   updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    UPDATE_PASSWORD: `
      UPDATE client_portal_users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    UPDATE_STATUS: `
      UPDATE client_portal_users SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    UPDATE_LOGIN_ATTEMPTS: `
      UPDATE client_portal_users SET failed_login_attempts = $2, account_locked_until = $3, 
                                   last_login = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM client_portal_users WHERE id = $1
    `,
    SEARCH: `
      SELECT cpu.*, c.name as client_name
      FROM client_portal_users cpu
      JOIN clients c ON cpu.client_id = c.id
      WHERE ($1::text IS NULL OR cpu.email ILIKE $1 OR cpu.first_name ILIKE $1 OR cpu.last_name ILIKE $1)
      AND ($2::client_portal_user_status_enum IS NULL OR cpu.status = $2)
      AND ($3::uuid IS NULL OR cpu.client_id = $3)
      ORDER BY cpu.created_at DESC
      LIMIT $4 OFFSET $5
    `
  },

  CLIENT_PORTAL_SESSIONS: {
    CREATE: `
      INSERT INTO client_portal_sessions (client_user_id, session_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    GET_BY_TOKEN: `
      SELECT cps.*, cpu.email, cpu.first_name, cpu.last_name, c.name as client_name
      FROM client_portal_sessions cps
      JOIN client_portal_users cpu ON cps.client_user_id = cpu.id
      JOIN clients c ON cpu.client_id = c.id
      WHERE cps.session_token = $1 AND cps.expires_at > NOW()
    `,
    DELETE_BY_TOKEN: `
      DELETE FROM client_portal_sessions WHERE session_token = $1
    `,
    DELETE_BY_USER_ID: `
      DELETE FROM client_portal_sessions WHERE client_user_id = $1
    `,
    DELETE_EXPIRED: `
      DELETE FROM client_portal_sessions WHERE expires_at <= NOW()
    `
  },

  CLIENT_PORTAL_CASES: {
    GET_BY_CLIENT_ID: `
      SELECT c.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name,
             (SELECT COUNT(*) FROM documents WHERE case_id = c.id) as document_count,
             (SELECT COUNT(*) FROM time_entries WHERE case_id = c.id) as time_entry_count
      FROM cases c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.client_id = $1
      ORDER BY c.created_at DESC
    `,
    GET_CASE_DETAILS: `
      SELECT c.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name,
             cl.name as client_name, cl.email as client_email
      FROM cases c
      LEFT JOIN users u ON c.assigned_to = u.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = $1 AND c.client_id = $2
    `,
    GET_CASE_DOCUMENTS: `
      SELECT d.*, u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = $1
      ORDER BY d.created_at DESC
    `,
    GET_CASE_UPDATES: `
      SELECT 'document_uploaded' as update_type, d.title as title, d.created_at as date,
             u.first_name, u.last_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = $1
      UNION ALL
      SELECT 'case_status_changed' as update_type, c.title as title, c.updated_at as date,
             u.first_name, u.last_name
      FROM cases c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = $1 AND c.updated_at > c.created_at
      ORDER BY date DESC
      LIMIT 20
    `
  },

  CLIENT_PORTAL_MESSAGES: {
    CREATE: `
      INSERT INTO internal_messages (subject, content, sender_id, message_type, priority, 
                                    case_id, client_id, is_client_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `,
    GET_CLIENT_MESSAGES: `
      SELECT im.*, u.first_name as sender_first_name, u.last_name as sender_last_name,
             c.case_number, c.title as case_title
      FROM internal_messages im
      LEFT JOIN users u ON im.sender_id = u.id
      LEFT JOIN cases c ON im.case_id = c.id
      WHERE im.client_id = $1 AND im.is_client_message = true
      ORDER BY im.created_at DESC
    `,
    GET_CASE_MESSAGES: `
      SELECT im.*, u.first_name as sender_first_name, u.last_name as sender_last_name
      FROM internal_messages im
      LEFT JOIN users u ON im.sender_id = u.id
      WHERE im.case_id = $1 AND im.is_client_message = true
      ORDER BY im.created_at DESC
    `
  },

  // Content Management SQL Queries
  CONTENT_CATEGORIES: {
    CREATE: `
      INSERT INTO content_categories (name, slug, description, parent_category_id, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT cc.*, pcc.name as parent_category_name
      FROM content_categories cc
      LEFT JOIN content_categories pcc ON cc.parent_category_id = pcc.id
      WHERE cc.id = $1
    `,
    GET_ALL: `
      SELECT cc.*, pcc.name as parent_category_name,
             (SELECT COUNT(*) FROM articles WHERE category_id = cc.id AND status = 'published') as article_count
      FROM content_categories cc
      LEFT JOIN content_categories pcc ON cc.parent_category_id = pcc.id
      WHERE cc.is_active = true
      ORDER BY cc.sort_order ASC, cc.name ASC
    `,
    GET_HIERARCHICAL: `
      WITH RECURSIVE category_tree AS (
        SELECT id, name, slug, description, parent_category_id, is_active, sort_order, 0 as level
        FROM content_categories
        WHERE parent_category_id IS NULL AND is_active = true
        UNION ALL
        SELECT cc.id, cc.name, cc.slug, cc.description, cc.parent_category_id, cc.is_active, cc.sort_order, ct.level + 1
        FROM content_categories cc
        JOIN category_tree ct ON cc.parent_category_id = ct.id
        WHERE cc.is_active = true
      )
      SELECT * FROM category_tree ORDER BY level, sort_order, name
    `,
    UPDATE: `
      UPDATE content_categories SET name = $2, slug = $3, description = $4, 
                                   parent_category_id = $5, is_active = $6, sort_order = $7,
                                   updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM content_categories WHERE id = $1
    `,
    GET_BY_SLUG: `
      SELECT * FROM content_categories WHERE slug = $1 AND is_active = true
    `
  },

  ARTICLES: {
    CREATE: `
      INSERT INTO articles (title, slug, excerpt, content, featured_image_url, category_id, 
                           author_id, status, published_at, meta_title, meta_description, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             cc.name as category_name, cc.slug as category_slug
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE a.id = $1
    `,
    GET_BY_SLUG: `
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             cc.name as category_name, cc.slug as category_slug
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE a.slug = $1 AND a.status = 'published'
    `,
    GET_ALL: `
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             cc.name as category_name, cc.slug as category_slug
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE ($1::text IS NULL OR a.status = $1)
      AND ($2::uuid IS NULL OR a.category_id = $2)
      AND ($3::uuid IS NULL OR a.author_id = $3)
      ORDER BY a.created_at DESC
      LIMIT $4 OFFSET $5
    `,
    GET_PUBLISHED: `
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             cc.name as category_name, cc.slug as category_slug
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE a.status = 'published'
      AND ($1::uuid IS NULL OR a.category_id = $1)
      ORDER BY a.published_at DESC
      LIMIT $2 OFFSET $3
    `,
    UPDATE: `
      UPDATE articles SET title = $2, slug = $3, excerpt = $4, content = $5,
                         featured_image_url = $6, category_id = $7, status = $8,
                         published_at = $9, meta_title = $10, meta_description = $11,
                         tags = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM articles WHERE id = $1
    `,
    INCREMENT_VIEW_COUNT: `
      UPDATE articles SET view_count = view_count + 1 WHERE id = $1
    `,
    INCREMENT_LIKE_COUNT: `
      UPDATE articles SET like_count = like_count + 1 WHERE id = $1
    `,
    INCREMENT_SHARE_COUNT: `
      UPDATE articles SET share_count = share_count + 1 WHERE id = $1
    `,
    SEARCH: `
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             cc.name as category_name, cc.slug as category_slug
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE a.status = 'published'
      AND (a.title ILIKE $1 OR a.content ILIKE $1 OR a.excerpt ILIKE $1)
      ORDER BY a.published_at DESC
      LIMIT $2 OFFSET $3
    `,
    GET_FEATURED: `
      SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name,
             cc.name as category_name, cc.slug as category_slug
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE a.status = 'published'
      ORDER BY a.view_count DESC, a.published_at DESC
      LIMIT $1
    `
  },

  ARTICLE_COMMENTS: {
    CREATE: `
      INSERT INTO article_comments (article_id, author_name, author_email, content, 
                                   parent_comment_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    GET_BY_ARTICLE_ID: `
      SELECT ac.*, 
             (SELECT COUNT(*) FROM article_comments WHERE parent_comment_id = ac.id AND status = 'approved') as reply_count
      FROM article_comments ac
      WHERE ac.article_id = $1 AND ac.status = 'approved'
      ORDER BY ac.created_at ASC
    `,
    GET_BY_ID: `
      SELECT * FROM article_comments WHERE id = $1
    `,
    UPDATE_STATUS: `
      UPDATE article_comments SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM article_comments WHERE id = $1
    `,
    GET_PENDING: `
      SELECT ac.*, a.title as article_title, a.slug as article_slug
      FROM article_comments ac
      JOIN articles a ON ac.article_id = a.id
      WHERE ac.status = 'pending'
      ORDER BY ac.created_at DESC
      LIMIT $1 OFFSET $2
    `
  },

  NEWSLETTERS: {
    CREATE: `
      INSERT INTO newsletters (title, subject, content, template_id, status, scheduled_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    GET_BY_ID: `
      SELECT n.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name,
             et.name as template_name
      FROM newsletters n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN email_templates et ON n.template_id = et.id
      WHERE n.id = $1
    `,
    GET_ALL: `
      SELECT n.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM newsletters n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
      LIMIT $1 OFFSET $2
    `,
    UPDATE: `
      UPDATE newsletters SET title = $2, subject = $3, content = $4, template_id = $5,
                             status = $6, scheduled_at = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM newsletters WHERE id = $1
    `,
    UPDATE_SENT_STATS: `
      UPDATE newsletters SET sent_at = $2, recipient_count = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
    UPDATE_OPENED_COUNT: `
      UPDATE newsletters SET opened_count = opened_count + 1 WHERE id = $1
    `,
    UPDATE_CLICKED_COUNT: `
      UPDATE newsletters SET clicked_count = clicked_count + 1 WHERE id = $1
    `,
    GET_SCHEDULED: `
      SELECT * FROM newsletters 
      WHERE status = 'scheduled' AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `
  },

  NEWSLETTER_SUBSCRIBERS: {
    CREATE: `
      INSERT INTO newsletter_subscribers (email, first_name, last_name, source, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    GET_BY_EMAIL: `
      SELECT * FROM newsletter_subscribers WHERE email = $1
    `,
    GET_ALL: `
      SELECT * FROM newsletter_subscribers 
      WHERE is_active = true
      ORDER BY subscription_date DESC
      LIMIT $1 OFFSET $2
    `,
    UNSUBSCRIBE: `
      UPDATE newsletter_subscribers SET is_active = false, unsubscribe_date = NOW(),
                                       unsubscribe_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1 RETURNING *
    `,
    RESUBSCRIBE: `
      UPDATE newsletter_subscribers SET is_active = true, unsubscribe_date = NULL,
                                       unsubscribe_reason = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1 RETURNING *
    `,
    DELETE: `
      DELETE FROM newsletter_subscribers WHERE id = $1
    `,
    GET_STATS: `
      SELECT 
        COUNT(*) as total_subscribers,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_subscribers,
        COUNT(CASE WHEN is_active = false THEN 1 END) as unsubscribed_subscribers,
        COUNT(CASE WHEN subscription_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_last_30_days
      FROM newsletter_subscribers
    `
  },

  CONTENT_ANALYTICS: {
    CREATE: `
      INSERT INTO content_analytics (content_type, content_id, action, user_id, ip_address, 
                                    user_agent, referrer_url, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    GET_CONTENT_STATS: `
      SELECT 
        content_type,
        content_id,
        action,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM content_analytics
      WHERE content_id = $1 AND content_type = $2
      GROUP BY content_type, content_id, action
    `,
    GET_POPULAR_CONTENT: `
      SELECT 
        content_type,
        content_id,
        action,
        COUNT(*) as count
      FROM content_analytics
      WHERE action = $1 AND created_at >= $2
      GROUP BY content_type, content_id, action
      ORDER BY count DESC
      LIMIT $3
    `,
    GET_USER_ACTIVITY: `
      SELECT 
        content_type,
        content_id,
        action,
        created_at
      FROM content_analytics
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `
  }
};

export default SQLQueries;