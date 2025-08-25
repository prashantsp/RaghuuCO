/**
 * Task Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for task management and time tracking functionality
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  startTaskTimer,
  stopTaskTimer
} from '@/controllers/taskController';

const router = Router();

/**
 * @route GET /api/v1/tasks
 * @desc Get all tasks with filtering and pagination
 * @access Private
 */
router.get('/', 
  authenticateToken, 
  getTasks
);

/**
 * @route GET /api/v1/tasks/stats
 * @desc Get task statistics
 * @access Private
 */
router.get('/stats', 
  authenticateToken, 
  getTaskStats
);

/**
 * @route GET /api/v1/tasks/:id
 * @desc Get task by ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken, 
  getTaskById
);

/**
 * @route POST /api/v1/tasks
 * @desc Create new task
 * @access Private
 */
router.post('/', 
  authenticateToken, 
  createTask
);

/**
 * @route PUT /api/v1/tasks/:id
 * @desc Update task
 * @access Private
 */
router.put('/:id', 
  authenticateToken, 
  updateTask
);

/**
 * @route DELETE /api/v1/tasks/:id
 * @desc Delete task
 * @access Private
 */
router.delete('/:id', 
  authenticateToken, 
  deleteTask
);

/**
 * @route POST /api/v1/tasks/:id/start-timer
 * @desc Start time tracking for task
 * @access Private
 */
router.post('/:id/start-timer', 
  authenticateToken, 
  startTaskTimer
);

/**
 * @route POST /api/v1/tasks/:id/stop-timer
 * @desc Stop time tracking for task
 * @access Private
 */
router.post('/:id/stop-timer', 
  authenticateToken, 
  stopTaskTimer
);

export default router;