"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCases = getCases;
exports.getCaseById = getCaseById;
exports.createCase = createCase;
exports.updateCase = updateCase;
exports.deleteCase = deleteCase;
exports.getCaseStats = getCaseStats;
const roleAccess_1 = require("@/utils/roleAccess");
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default(databaseConfig);
async function getCases(req, res) {
    try {
        const { page = 1, limit = 20, search, status, priority, assignedTo, clientId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'case:read')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view cases'
                }
            });
            return;
        }
        const offset = (Number(page) - 1) * Number(limit);
        const searchConditions = [];
        const searchParams = [];
        if (search) {
            searchConditions.push(`(c.case_number ILIKE $${searchParams.length + 1} OR c.title ILIKE $${searchParams.length + 1} OR c.description ILIKE $${searchParams.length + 1})`);
            searchParams.push(`%${search}%`);
        }
        if (status) {
            searchConditions.push(`c.status = $${searchParams.length + 1}`);
            searchParams.push(status);
        }
        if (priority) {
            searchConditions.push(`c.priority = $${searchParams.length + 1}`);
            searchParams.push(priority);
        }
        if (assignedTo) {
            searchConditions.push(`c.assigned_to = $${searchParams.length + 1}`);
            searchParams.push(assignedTo);
        }
        if (clientId) {
            searchConditions.push(`c.client_id = $${searchParams.length + 1}`);
            searchParams.push(clientId);
        }
        const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
        const orderClause = `ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;
        const cases = await db.query(`
      SELECT 
        c.id, c.case_number, c.title, c.description, c.status, c.priority,
        c.client_id, c.assigned_to, c.assigned_by, c.created_at, c.updated_at,
        c.due_date, c.tags, c.category, c.estimated_hours, c.actual_hours, c.billing_rate,
        cl.first_name as client_first_name, cl.last_name as client_last_name, cl.email as client_email,
        u.first_name as assigned_first_name, u.last_name as assigned_last_name,
        (SELECT COUNT(*) FROM documents WHERE case_id = c.id) as document_count,
        (SELECT COUNT(*) FROM time_entries WHERE case_id = c.id) as time_entry_count
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.assigned_to = u.id
      ${whereClause}
      ${orderClause}
      LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
    `, [...searchParams, Number(limit), offset]);
        const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM cases c
      ${whereClause}
    `, searchParams);
        const total = parseInt(countResult[0].total);
        logger_1.default.businessEvent('cases_retrieved', 'case', 'multiple', req.user?.id || 'system', {
            page: Number(page),
            limit: Number(limit),
            total,
            filters: { search, status, priority, assignedTo, clientId }
        });
        res.json({
            success: true,
            data: {
                cases,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting cases', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve cases'
            }
        });
    }
}
async function getCaseById(req, res) {
    try {
        const { id } = req.params;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'case:read')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view cases'
                }
            });
            return;
        }
        const caseData = await db.getCaseById(id);
        if (!caseData) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CASE_NOT_FOUND',
                    message: 'Case not found'
                }
            });
            return;
        }
        const documents = await db.query(`
      SELECT 
        id, title, file_name, file_size, file_type, created_at, uploaded_by
      FROM documents 
      WHERE case_id = $1 
      ORDER BY created_at DESC
    `, [id]);
        const timeEntries = await db.query(`
      SELECT 
        id, task_description, hours_worked, billing_rate, is_billable, date_worked, created_at
      FROM time_entries 
      WHERE case_id = $1 
      ORDER BY date_worked DESC
    `, [id]);
        const auditLogs = await db.query(`
      SELECT 
        action, old_values, new_values, created_at, user_id
      FROM audit_logs 
      WHERE resource_type = 'case' AND resource_id = $1 
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);
        logger_1.default.businessEvent('case_retrieved', 'case', id, req.user?.id || 'system');
        res.json({
            success: true,
            data: {
                case: caseData,
                documents,
                timeEntries,
                auditLogs
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting case by ID', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve case'
            }
        });
    }
}
async function createCase(req, res) {
    try {
        const { title, description, clientId, assignedTo, priority, dueDate, tags, category, estimatedHours, billingRate } = req.body;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'case:create')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to create cases'
                }
            });
            return;
        }
        const client = await db.getClientById(clientId);
        if (!client) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'CLIENT_NOT_FOUND',
                    message: 'Client not found'
                }
            });
            return;
        }
        if (assignedTo) {
            const assignedUser = await db.getUserById(assignedTo);
            if (!assignedUser) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'Assigned user not found'
                    }
                });
                return;
            }
        }
        const caseNumber = await generateCaseNumber();
        const caseData = await db.createCase({
            caseNumber,
            title,
            description,
            clientId,
            assignedTo: assignedTo || req.user?.id,
            assignedBy: req.user?.id || 'system',
            priority: priority || 'medium',
            dueDate,
            tags: tags || [],
            category: category || 'general',
            estimatedHours,
            billingRate
        });
        logger_1.default.businessEvent('case_created', 'case', caseData.id, req.user?.id || 'system', {
            caseNumber,
            clientId,
            assignedTo,
            createdBy: req.user?.id
        });
        res.status(201).json({
            success: true,
            data: { case: caseData }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating case', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create case'
            }
        });
    }
}
async function updateCase(req, res) {
    try {
        const { id } = req.params;
        const { title, description, assignedTo, status, priority, dueDate, tags, category, estimatedHours, actualHours, billingRate } = req.body;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'case:update')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to update cases'
                }
            });
            return;
        }
        const existingCase = await db.getCaseById(id);
        if (!existingCase) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CASE_NOT_FOUND',
                    message: 'Case not found'
                }
            });
            return;
        }
        if (assignedTo && assignedTo !== existingCase.assigned_to) {
            const assignedUser = await db.getUserById(assignedTo);
            if (!assignedUser) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'Assigned user not found'
                    }
                });
                return;
            }
        }
        const updateData = {};
        if (title)
            updateData.title = title;
        if (description)
            updateData.description = description;
        if (assignedTo)
            updateData.assignedTo = assignedTo;
        if (status)
            updateData.status = status;
        if (priority)
            updateData.priority = priority;
        if (dueDate)
            updateData.dueDate = dueDate;
        if (tags)
            updateData.tags = tags;
        if (category)
            updateData.category = category;
        if (estimatedHours !== undefined)
            updateData.estimatedHours = estimatedHours;
        if (actualHours !== undefined)
            updateData.actualHours = actualHours;
        if (billingRate !== undefined)
            updateData.billingRate = billingRate;
        const caseData = await db.updateCase(id, updateData);
        logger_1.default.businessEvent('case_updated', 'case', id, req.user?.id || 'system', {
            updatedFields: Object.keys(updateData),
            updatedBy: req.user?.id
        });
        res.json({
            success: true,
            data: { case: caseData }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating case', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update case'
            }
        });
    }
}
async function deleteCase(req, res) {
    try {
        const { id } = req.params;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'case:delete')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to delete cases'
                }
            });
            return;
        }
        const existingCase = await db.getCaseById(id);
        if (!existingCase) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CASE_NOT_FOUND',
                    message: 'Case not found'
                }
            });
            return;
        }
        if (existingCase.status === 'open' || existingCase.status === 'in_progress') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'CASE_IS_ACTIVE',
                    message: 'Cannot delete active case'
                }
            });
            return;
        }
        await db.query('UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2', ['deleted', id]);
        logger_1.default.businessEvent('case_deleted', 'case', id, req.user?.id || 'system', {
            deletedCase: existingCase.case_number,
            deletedBy: req.user?.id
        });
        res.json({
            success: true,
            message: 'Case deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting case', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete case'
            }
        });
    }
}
async function getCaseStats(req, res) {
    try {
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'case:read')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view case statistics'
                }
            });
            return;
        }
        const totalCases = await db.query('SELECT COUNT(*) as count FROM cases WHERE status != $1', ['deleted']);
        const casesByStatus = await db.query(`
      SELECT status, COUNT(*) as count
      FROM cases 
      WHERE status != 'deleted'
      GROUP BY status
      ORDER BY count DESC
    `);
        const casesByPriority = await db.query(`
      SELECT priority, COUNT(*) as count
      FROM cases 
      WHERE status != 'deleted'
      GROUP BY priority
      ORDER BY count DESC
    `);
        const casesByUser = await db.query(`
      SELECT 
        u.first_name, u.last_name, u.email,
        COUNT(c.id) as case_count
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_to AND c.status != 'deleted'
      WHERE u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY case_count DESC
      LIMIT 10
    `);
        const recentCases = await db.query(`
      SELECT 
        c.id, c.case_number, c.title, c.status, c.priority, c.created_at,
        cl.first_name as client_first_name, cl.last_name as client_last_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.status != 'deleted'
      ORDER BY c.created_at DESC
      LIMIT 10
    `);
        logger_1.default.businessEvent('case_stats_retrieved', 'case', 'statistics', req.user?.id || 'system');
        res.json({
            success: true,
            data: {
                totalCases: parseInt(totalCases[0].count),
                casesByStatus,
                casesByPriority,
                casesByUser,
                recentCases
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting case statistics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve case statistics'
            }
        });
    }
}
async function generateCaseNumber() {
    const year = new Date().getFullYear();
    const result = await db.query(`
    SELECT COUNT(*) as count 
    FROM cases 
    WHERE case_number LIKE $1
  `, [`CASE-${year}-%`]);
    const count = parseInt(result[0].count) + 1;
    return `CASE-${year}-${count.toString().padStart(4, '0')}`;
}
exports.default = {
    getCases,
    getCaseById,
    createCase,
    updateCase,
    deleteCase,
    getCaseStats
};
//# sourceMappingURL=caseController.js.map