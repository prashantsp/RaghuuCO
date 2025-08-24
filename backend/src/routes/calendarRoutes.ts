/**
 * Calendar Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for calendar and scheduling functionality
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getCalendarEvents,
  getUpcomingEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  checkSchedulingConflicts
} from '@/controllers/calendarController';

const router = Router();

/**
 * @route GET /api/v1/calendar/events
 * @desc Get all calendar events with filtering and pagination
 * @access Private
 */
router.get('/events', 
  authenticateToken, 
  getCalendarEvents
);

/**
 * @route GET /api/v1/calendar/events/upcoming
 * @desc Get upcoming calendar events
 * @access Private
 */
router.get('/events/upcoming', 
  authenticateToken, 
  getUpcomingEvents
);

/**
 * @route GET /api/v1/calendar/events/:id
 * @desc Get calendar event by ID
 * @access Private
 */
router.get('/events/:id', 
  authenticateToken, 
  getCalendarEventById
);

/**
 * @route POST /api/v1/calendar/events
 * @desc Create new calendar event
 * @access Private
 */
router.post('/events', 
  authenticateToken, 
  createCalendarEvent
);

/**
 * @route PUT /api/v1/calendar/events/:id
 * @desc Update calendar event
 * @access Private
 */
router.put('/events/:id', 
  authenticateToken, 
  updateCalendarEvent
);

/**
 * @route DELETE /api/v1/calendar/events/:id
 * @desc Delete calendar event
 * @access Private
 */
router.delete('/events/:id', 
  authenticateToken, 
  deleteCalendarEvent
);

/**
 * @route POST /api/v1/calendar/events/check-conflicts
 * @desc Check for scheduling conflicts
 * @access Private
 */
router.post('/events/check-conflicts', 
  authenticateToken, 
  checkSchedulingConflicts
);

export default router;