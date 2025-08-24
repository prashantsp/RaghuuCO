/**
 * Task Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for task management including task tracking and time entries
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import { authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import logger from '@/utils/logger';
import { SQLQueries } from '@/utils/db_SQLQueries';

const db = new DatabaseService();

/**
 * Get all tasks with filtering and pagination
 * 
 * @route GET /api/v1/tasks
 * @access Private
 */
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      priority, 
      taskType, 
      assignedTo, 
      caseId, 
      clientId 
    } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching tasks', { userId, filters: req.query });

    const result = await db.query(SQLQueries.TASKS.SEARCH, [
      search || null,
      status || null,
      priority || null,
      taskType || null,
      assignedTo || null,
      caseId || null,
      clientId || null,
      parseInt(limit as string),
      offset
    ]);

    const tasks = result.rows;

    // Get total count for pagination
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

    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / parseInt(limit as string));

    logger.info('Tasks fetched successfully', { userId, count: tasks.length });

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching tasks', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASKS_FETCH_ERROR',
        message: 'Failed to fetch tasks'
      }
    });
  }
};

/**
 * Get task by ID
 * 
 * @route GET /api/v1/tasks/:id
 * @access Private
 */
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Fetching task by ID', { userId, taskId: id });

    const result = await db.query(SQLQueries.TASKS.GET_BY_ID, [id]);
    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Get task dependencies
    const dependenciesResult = await db.query(SQLQueries.TASKS.GET_DEPENDENCIES, [id]);
    const dependencies = dependenciesResult.rows;

    // Get task time entries
    const timeEntriesResult = await db.query(SQLQueries.TASK_TIME_ENTRIES.GET_BY_TASK_ID, [id]);
    const timeEntries = timeEntriesResult.rows;

    logger.info('Task fetched successfully', { userId, taskId: id });

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
  } catch (error) {
    logger.error('Error fetching task', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_FETCH_ERROR',
        message: 'Failed to fetch task'
      }
    });
  }
};

/**
 * Create new task
 * 
 * @route POST /api/v1/tasks
 * @access Private
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      title,
      description,
      taskType,
      status,
      priority,
      caseId,
      clientId,
      assignedTo,
      estimatedHours,
      dueDate,
      parentTaskId,
      tags,
      dependencies
    } = req.body;

    logger.info('Creating new task', { userId, title, taskType });

    // Create task
    const result = await db.query(SQLQueries.TASKS.CREATE, [
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

    const task = result.rows[0];

    // Create dependencies if provided
    if (dependencies && Array.isArray(dependencies)) {
      for (const dependency of dependencies) {
        await db.query(SQLQueries.TASK_DEPENDENCIES.CREATE, [
          task.id,
          dependency.taskId,
          dependency.type || 'finish_to_start'
        ]);
      }
    }

    logger.businessEvent('task_created', 'task', task.id, userId);

    res.status(201).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    logger.error('Error creating task', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_CREATE_ERROR',
        message: 'Failed to create task'
      }
    });
  }
};

/**
 * Update task
 * 
 * @route PUT /api/v1/tasks/:id
 * @access Private
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      title,
      description,
      taskType,
      status,
      priority,
      caseId,
      clientId,
      assignedTo,
      estimatedHours,
      actualHours,
      dueDate,
      completedDate,
      parentTaskId,
      tags
    } = req.body;

    logger.info('Updating task', { userId, taskId: id });

    // Check if task exists
    const currentResult = await db.query(SQLQueries.TASKS.GET_BY_ID, [id]);
    const currentTask = currentResult.rows[0];

    if (!currentTask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Update task
    const result = await db.query(SQLQueries.TASKS.UPDATE, [
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

    const updatedTask = result.rows[0];

    logger.businessEvent('task_updated', 'task', id, userId);

    res.json({
      success: true,
      data: { task: updatedTask }
    });
  } catch (error) {
    logger.error('Error updating task', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_UPDATE_ERROR',
        message: 'Failed to update task'
      }
    });
  }
};

/**
 * Delete task
 * 
 * @route DELETE /api/v1/tasks/:id
 * @access Private
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Deleting task', { userId, taskId: id });

    // Check if task exists
    const currentResult = await db.query(SQLQueries.TASKS.GET_BY_ID, [id]);
    const task = currentResult.rows[0];

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Delete task dependencies first
    await db.query(SQLQueries.TASK_DEPENDENCIES.DELETE_BY_TASK_ID, [id]);

    // Delete task
    await db.query(SQLQueries.TASKS.DELETE, [id]);

    logger.businessEvent('task_deleted', 'task', id, userId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting task', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_DELETE_ERROR',
        message: 'Failed to delete task'
      }
    });
  }
};

/**
 * Get task statistics
 * 
 * @route GET /api/v1/tasks/stats
 * @access Private
 */
export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { assignedTo, caseId } = req.query;

    logger.info('Fetching task statistics', { userId });

    const result = await db.query(SQLQueries.TASKS.GET_STATS, [
      assignedTo || null,
      caseId || null
    ]);

    const stats = result.rows[0];

    logger.info('Task statistics fetched successfully', { userId });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Error fetching task statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_STATS_ERROR',
        message: 'Failed to fetch task statistics'
      }
    });
  }
};

/**
 * Start time tracking for task
 * 
 * @route POST /api/v1/tasks/:id/start-timer
 * @access Private
 */
export const startTaskTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const { description } = req.body;

    logger.info('Starting task timer', { userId, taskId: id });

    // Check if user has active timer
    const activeTimerResult = await db.query(SQLQueries.TASK_TIME_ENTRIES.GET_ACTIVE_TIMER, [userId]);
    const activeTimer = activeTimerResult.rows[0];

    if (activeTimer) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACTIVE_TIMER_EXISTS',
          message: 'You already have an active timer running'
        }
      });
    }

    // Create time entry
    const result = await db.query(SQLQueries.TASK_TIME_ENTRIES.CREATE, [
      id,
      userId,
      new Date(),
      null,
      null,
      description || '',
      true,
      null
    ]);

    const timeEntry = result.rows[0];

    logger.businessEvent('task_timer_started', 'task_time_entry', timeEntry.id, userId);

    res.json({
      success: true,
      data: { timeEntry }
    });
  } catch (error) {
    logger.error('Error starting task timer', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_TIMER_START_ERROR',
        message: 'Failed to start task timer'
      }
    });
  }
};

/**
 * Stop time tracking for task
 * 
 * @route POST /api/v1/tasks/:id/stop-timer
 * @access Private
 */
export const stopTaskTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Stopping task timer', { userId, taskId: id });

    // Get active timer
    const activeTimerResult = await db.query(SQLQueries.TASK_TIME_ENTRIES.GET_ACTIVE_TIMER, [userId]);
    const activeTimer = activeTimerResult.rows[0];

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

    // Update time entry
    const result = await db.query(SQLQueries.TASK_TIME_ENTRIES.UPDATE, [
      activeTimer.id,
      activeTimer.start_time,
      endTime,
      durationMinutes,
      activeTimer.description,
      activeTimer.is_billable,
      activeTimer.billing_rate
    ]);

    const timeEntry = result.rows[0];

    logger.businessEvent('task_timer_stopped', 'task_time_entry', timeEntry.id, userId);

    res.json({
      success: true,
      data: { timeEntry }
    });
  } catch (error) {
    logger.error('Error stopping task timer', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_TIMER_STOP_ERROR',
        message: 'Failed to stop task timer'
      }
    });
  }
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  startTaskTimer,
  stopTaskTimer
};