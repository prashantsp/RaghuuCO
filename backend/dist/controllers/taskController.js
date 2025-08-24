"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopTaskTimer = exports.startTaskTimer = exports.getTaskStats = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.default();
const getTasks = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, search, status, priority, taskType, assignedTo, caseId, clientId } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching tasks', { userId, filters: req.query });
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASKS.SEARCH, [
            search || null,
            status || null,
            priority || null,
            taskType || null,
            assignedTo || null,
            caseId || null,
            clientId || null,
            parseInt(limit),
            offset
        ]);
        const tasks = result.rows;
        const countResult = await db.query(`
      SELECT COUNT(*) as total
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
    `, [search || null, status || null, priority || null, taskType || null, assignedTo || null, caseId || null, clientId || null]);
        const total = parseInt(countResult[0]?.total || '0');
        const totalPages = Math.ceil(total / parseInt(limit));
        logger_1.default.info('Tasks fetched successfully', { userId, count: tasks.length });
        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching tasks', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASKS_FETCH_ERROR',
                message: 'Failed to fetch tasks'
            }
        });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Fetching task by ID', { userId, taskId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASKS.GET_BY_ID, [id]);
        const task = result[0];
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TASK_NOT_FOUND',
                    message: 'Task not found'
                }
            });
        }
        const dependenciesResult = await db.query(db_SQLQueries_1.SQLQueries.TASKS.GET_DEPENDENCIES, [id]);
        const dependencies = dependenciesResult;
        const timeEntriesResult = await db.query(db_SQLQueries_1.SQLQueries.TASK_TIME_ENTRIES.GET_BY_TASK_ID, [id]);
        const timeEntries = timeEntriesResult;
        logger_1.default.info('Task fetched successfully', { userId, taskId: id });
        res.json({
            success: true,
            data: {
                task: {
                    ...task,
                    dependencies,
                    timeEntries
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching task', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_FETCH_ERROR',
                message: 'Failed to fetch task'
            }
        });
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, description, taskType, status, priority, caseId, clientId, assignedTo, estimatedHours, dueDate, parentTaskId, tags, dependencies } = req.body;
        logger_1.default.info('Creating new task', { userId, title, taskType });
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASKS.CREATE, [
            title,
            description,
            taskType || 'other',
            status || 'pending',
            priority || 'medium',
            caseId || null,
            clientId || null,
            assignedTo || null,
            userId,
            estimatedHours || null,
            dueDate || null,
            parentTaskId || null,
            tags || []
        ]);
        const task = result[0];
        if (dependencies && Array.isArray(dependencies)) {
            for (const dependency of dependencies) {
                await db.query(db_SQLQueries_1.SQLQueries.TASK_DEPENDENCIES.CREATE, [
                    task.id,
                    dependency.taskId,
                    dependency.type || 'finish_to_start'
                ]);
            }
        }
        logger_1.default.businessEvent('task_created', 'task', task.id, userId);
        res.status(201).json({
            success: true,
            data: { task }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating task', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_CREATE_ERROR',
                message: 'Failed to create task'
            }
        });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { title, description, taskType, status, priority, caseId, clientId, assignedTo, estimatedHours, actualHours, dueDate, completedDate, parentTaskId, tags } = req.body;
        logger_1.default.info('Updating task', { userId, taskId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.TASKS.GET_BY_ID, [id]);
        const currentTask = currentResult[0];
        if (!currentTask) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TASK_NOT_FOUND',
                    message: 'Task not found'
                }
            });
        }
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASKS.UPDATE, [
            id,
            title || currentTask.title,
            description || currentTask.description,
            taskType || currentTask.task_type,
            status || currentTask.status,
            priority || currentTask.priority,
            caseId || currentTask.case_id,
            clientId || currentTask.client_id,
            assignedTo || currentTask.assigned_to,
            estimatedHours || currentTask.estimated_hours,
            actualHours || currentTask.actual_hours,
            dueDate || currentTask.due_date,
            completedDate || currentTask.completed_date,
            parentTaskId || currentTask.parent_task_id,
            tags || currentTask.tags
        ]);
        const updatedTask = result[0];
        logger_1.default.businessEvent('task_updated', 'task', id, userId);
        res.json({
            success: true,
            data: { task: updatedTask }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating task', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_UPDATE_ERROR',
                message: 'Failed to update task'
            }
        });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Deleting task', { userId, taskId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.TASKS.GET_BY_ID, [id]);
        const task = currentResult[0];
        if (!task) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TASK_NOT_FOUND',
                    message: 'Task not found'
                }
            });
        }
        await db.query(db_SQLQueries_1.SQLQueries.TASK_DEPENDENCIES.DELETE_BY_TASK_ID, [id]);
        await db.query(db_SQLQueries_1.SQLQueries.TASKS.DELETE, [id]);
        logger_1.default.businessEvent('task_deleted', 'task', id, userId);
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting task', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_DELETE_ERROR',
                message: 'Failed to delete task'
            }
        });
    }
};
exports.deleteTask = deleteTask;
const getTaskStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { assignedTo, caseId } = req.query;
        logger_1.default.info('Fetching task statistics', { userId });
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASKS.GET_STATS, [
            assignedTo || null,
            caseId || null
        ]);
        const stats = result[0];
        logger_1.default.info('Task statistics fetched successfully', { userId });
        res.json({
            success: true,
            data: { stats }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching task statistics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_STATS_ERROR',
                message: 'Failed to fetch task statistics'
            }
        });
    }
};
exports.getTaskStats = getTaskStats;
const startTaskTimer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { description } = req.body;
        logger_1.default.info('Starting task timer', { userId, taskId: id });
        const activeTimerResult = await db.query(db_SQLQueries_1.SQLQueries.TASK_TIME_ENTRIES.GET_ACTIVE_TIMER, [userId]);
        const activeTimer = activeTimerResult[0];
        if (activeTimer) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ACTIVE_TIMER_EXISTS',
                    message: 'You already have an active timer running'
                }
            });
        }
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASK_TIME_ENTRIES.CREATE, [
            id,
            userId,
            new Date(),
            null,
            null,
            description || '',
            true,
            null
        ]);
        const timeEntry = result[0];
        logger_1.default.businessEvent('task_timer_started', 'task_time_entry', timeEntry.id, userId);
        res.json({
            success: true,
            data: { timeEntry }
        });
    }
    catch (error) {
        logger_1.default.error('Error starting task timer', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_TIMER_START_ERROR',
                message: 'Failed to start task timer'
            }
        });
    }
};
exports.startTaskTimer = startTaskTimer;
const stopTaskTimer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Stopping task timer', { userId, taskId: id });
        const activeTimerResult = await db.query(db_SQLQueries_1.SQLQueries.TASK_TIME_ENTRIES.GET_ACTIVE_TIMER, [userId]);
        const activeTimer = activeTimerResult[0];
        if (!activeTimer) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_ACTIVE_TIMER',
                    message: 'No active timer found'
                }
            });
        }
        const endTime = new Date();
        const durationMinutes = Math.round((endTime.getTime() - new Date(activeTimer.start_time).getTime()) / (1000 * 60));
        const result = await db.query(db_SQLQueries_1.SQLQueries.TASK_TIME_ENTRIES.UPDATE, [
            activeTimer.id,
            activeTimer.start_time,
            endTime,
            durationMinutes,
            activeTimer.description,
            activeTimer.is_billable,
            activeTimer.billing_rate
        ]);
        const timeEntry = result[0];
        logger_1.default.businessEvent('task_timer_stopped', 'task_time_entry', timeEntry.id, userId);
        res.json({
            success: true,
            data: { timeEntry }
        });
    }
    catch (error) {
        logger_1.default.error('Error stopping task timer', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TASK_TIMER_STOP_ERROR',
                message: 'Failed to stop task timer'
            }
        });
    }
};
exports.stopTaskTimer = stopTaskTimer;
exports.default = {
    getTasks: exports.getTasks,
    getTaskById: exports.getTaskById,
    createTask: exports.createTask,
    updateTask: exports.updateTask,
    deleteTask: exports.deleteTask,
    getTaskStats: exports.getTaskStats,
    startTaskTimer: exports.startTaskTimer,
    stopTaskTimer: exports.stopTaskTimer
};
//# sourceMappingURL=taskController.js.map