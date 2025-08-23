/**
 * Centralized Database SQL Queries
 * All SQL queries for the RAGHUU CO Legal Practice Management System
 * This file contains all database queries to ensure consistency and maintainability
 */

export const SQLQueries = {
  // User Management Queries
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
    CREATE_SESSION: `
      INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    
    GET_SESSION_BY_TOKEN: `
      SELECT * FROM user_sessions
      WHERE session_token = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    `,
    
    GET_SESSION_BY_REFRESH_TOKEN: `
      SELECT * FROM user_sessions
      WHERE refresh_token = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    `,
    
    GET_SESSIONS_BY_USER: `
      SELECT * FROM user_sessions
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `,
    
    DEACTIVATE_SESSION: `
      UPDATE user_sessions
      SET is_active = false
      WHERE session_token = $1
    `,
    
    DEACTIVATE_ALL_USER_SESSIONS: `
      UPDATE user_sessions
      SET is_active = false
      WHERE user_id = $1
    `,
    
    CLEANUP_EXPIRED_SESSIONS: `
      DELETE FROM user_sessions
      WHERE expires_at < CURRENT_TIMESTAMP
    `
  }
};

export default SQLQueries;