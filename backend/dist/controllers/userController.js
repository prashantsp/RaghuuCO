"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getUserActivity = getUserActivity;
exports.getAssignableRoles = getAssignableRoles;
const roleAccess_1 = require("@/utils/roleAccess");
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const auth_1 = require("@/middleware/auth");
const db = new DatabaseService_1.default(databaseConfig);
async function getUsers(req, res) {
    try {
        const { page = 1, limit = 20, search, role, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'user:read')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view users'
                }
            });
            return;
        }
        const offset = (Number(page) - 1) * Number(limit);
        const searchConditions = [];
        const searchParams = [];
        if (search) {
            searchConditions.push(`(first_name ILIKE $${searchParams.length + 1} OR last_name ILIKE $${searchParams.length + 1} OR email ILIKE $${searchParams.length + 1})`);
            searchParams.push(`%${search}%`);
        }
        if (role) {
            searchConditions.push(`role = $${searchParams.length + 1}`);
            searchParams.push(role);
        }
        if (isActive !== undefined) {
            searchConditions.push(`is_active = $${searchParams.length + 1}`);
            searchParams.push(isActive === 'true');
        }
        const whereClause = searchConditions.length > 0 ? `WHERE ${searchConditions.join(' AND ')}` : '';
        const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        const users = await db.query(`
      SELECT 
        id, email, first_name, last_name, role, phone, is_active, 
        email_verified, last_login, created_at, updated_at
      FROM users 
      ${whereClause}
      ${orderClause}
      LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}
    `, [...searchParams, Number(limit), offset]);
        const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM users 
      ${whereClause}
    `, searchParams);
        const total = parseInt(countResult[0].total);
        logger_1.default.businessEvent('users_retrieved', 'user', 'multiple', req.user?.id || 'system', {
            page: Number(page),
            limit: Number(limit),
            total,
            filters: { search, role, isActive }
        });
        res.json({
            success: true,
            data: {
                users,
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
        logger_1.default.error('Error getting users', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve users'
            }
        });
    }
}
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        if (req.user?.id !== id && !(0, roleAccess_1.hasPermission)(req.user?.role, 'user:read')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this user'
                }
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USER_ID',
                    message: 'User ID is required'
                }
            });
            return;
        }
        const user = await db.getUserById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
            return;
        }
        delete user.password_hash;
        logger_1.default.businessEvent('user_retrieved', 'user', id, req.user?.id || 'system');
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting user by ID', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve user'
            }
        });
    }
}
async function createUser(req, res) {
    try {
        const { email, password, firstName, lastName, role, phone } = req.body;
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'user:create')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to create users'
                }
            });
            return;
        }
        if (!(0, roleAccess_1.canManageUser)(req.user?.role, role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to assign this role'
                }
            });
            return;
        }
        if (!email) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'EMAIL_REQUIRED',
                    message: 'Email is required'
                }
            });
            return;
        }
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'EMAIL_EXISTS',
                    message: 'User with this email already exists'
                }
            });
            return;
        }
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const user = await db.createUser({
            email,
            passwordHash,
            firstName,
            lastName,
            role,
            phone
        });
        delete user.password_hash;
        logger_1.default.businessEvent('user_created', 'user', user.id, req.user?.id || 'system', {
            email,
            role,
            createdBy: req.user?.id
        });
        res.status(201).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create user'
            }
        });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, role, isActive } = req.body;
        if (!id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USER_ID',
                    message: 'User ID is required'
                }
            });
            return;
        }
        if (req.user?.id !== id && !(0, roleAccess_1.hasPermission)(req.user?.role, 'user:update')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to update this user'
                }
            });
            return;
        }
        const existingUser = await db.getUserById(id);
        if (!existingUser) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
            return;
        }
        if (role && !(0, roleAccess_1.canManageUser)(req.user?.role, role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to assign this role'
                }
            });
            return;
        }
        const updateData = {};
        if (firstName)
            updateData.firstName = firstName;
        if (lastName)
            updateData.lastName = lastName;
        if (phone !== undefined)
            updateData.phone = phone;
        if (role)
            updateData.role = role;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const user = await db.updateUser(id, updateData);
        delete user.password_hash;
        logger_1.default.businessEvent('user_updated', 'user', id, req.user?.id || 'system', {
            updatedFields: Object.keys(updateData),
            updatedBy: req.user?.id
        });
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update user'
            }
        });
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USER_ID',
                    message: 'User ID is required'
                }
            });
            return;
        }
        if (!(0, roleAccess_1.hasPermission)(req.user?.role, 'user:delete')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to delete users'
                }
            });
            return;
        }
        if (req.user?.id === id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'SELF_DELETE_NOT_ALLOWED',
                    message: 'You cannot delete your own account'
                }
            });
            return;
        }
        const existingUser = await db.getUserById(id);
        if (!existingUser) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
            return;
        }
        if (!(0, roleAccess_1.canManageUser)(req.user?.role, existingUser.role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to delete this user'
                }
            });
            return;
        }
        await db.query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
        logger_1.default.businessEvent('user_deleted', 'user', id, req.user?.id || 'system', {
            deletedUser: existingUser.email,
            deletedBy: req.user?.id
        });
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to delete user'
            }
        });
    }
}
async function getUserActivity(req, res) {
    try {
        const { id } = req.params;
        const { days = 30 } = req.query;
        if (!id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USER_ID',
                    message: 'User ID is required'
                }
            });
            return;
        }
        if (req.user?.id !== id && !(0, roleAccess_1.hasPermission)(req.user?.role, 'user:read')) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this user activity'
                }
            });
            return;
        }
        const auditLogs = await db.query(`
      SELECT 
        action, resource_type, resource_id, created_at, ip_address, user_agent
      FROM audit_logs 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
      LIMIT 100
    `, [id]);
        const loginHistory = await db.query(`
      SELECT 
        created_at, ip_address, user_agent
      FROM user_sessions 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);
        const activitySummary = await db.query(`
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY action
      ORDER BY count DESC
    `, [id]);
        logger_1.default.businessEvent('user_activity_retrieved', 'user', id, req.user?.id || 'system');
        res.json({
            success: true,
            data: {
                auditLogs,
                loginHistory,
                activitySummary,
                period: `${days} days`
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting user activity', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve user activity'
            }
        });
    }
}
async function getAssignableRoles(req, res) {
    try {
        const userRole = req.user?.role;
        if (!userRole) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User role is required'
                }
            });
            return;
        }
        const { getAssignableRoles } = await Promise.resolve().then(() => __importStar(require('@/utils/roleAccess')));
        const assignableRoles = getAssignableRoles(userRole);
        res.json({
            success: true,
            data: { roles: assignableRoles }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting assignable roles', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve assignable roles'
            }
        });
    }
}
exports.default = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserActivity,
    getAssignableRoles
};
//# sourceMappingURL=userController.js.map