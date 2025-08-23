/**
 * Task Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description API routes for task management and time tracking functionality
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import taskController from '@/controllers/taskController';

const router = Router();

/**
 * @route GET /api/v1/tasks
 * @desc Get all tasks with filtering and pagination
 * @access Private
 */
router.get('/', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_TASKS),
  taskController.getTasks
);

/**
 * @route GET /api/v1/tasks/stats
 * @desc Get task statistics
 * @access Private
 */
router.get('/stats', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_TASKS),
  taskController.getTaskStats
);

/**
 * @route GET /api/v1/tasks/:id
 * @desc Get task by ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_TASKS),
  taskController.getTaskById
);

/**
 * @route POST /api/v1/tasks
 * @desc Create new task
 * @access Private
 */
router.post('/', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_TASKS),
  taskController.createTask
);

/**
 * @route PUT /api/v1/tasks/:id
 * @desc Update task
 * @access Private
 */
router.put('/:id', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_TASKS),
  taskController.updateTask
);

/**
 * @route DELETE /api/v1/tasks/:id
 * @desc Delete task
 * @access Private
 */
router.delete('/:id', 
  authenticateToken, 
  authorizePermission(Permission.DELETE_TASKS),
  taskController.deleteTask
);

/**
 * @route POST /api/v1/tasks/:id/start-timer
 * @desc Start time tracking for task
 * @access Private
 */
router.post('/:id/start-timer', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_TIME_ENTRIES), // This is correct for time tracking
  taskController.startTaskTimer
);

/**
 * @route POST /api/v1/tasks/:id/stop-timer
 * @desc Stop time tracking for task
 * @access Private
 */
router.post('/:id/stop-timer', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_TIME_ENTRIES), // This is correct for time tracking
  taskController.stopTaskTimer
);

export default router;