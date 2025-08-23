/**
 * Calendar Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description API routes for calendar and scheduling functionality
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import calendarController from '@/controllers/calendarController';

const router = Router();

/**
 * @route GET /api/v1/calendar/events
 * @desc Get all calendar events with filtering and pagination
 * @access Private
 */
router.get('/events', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_CALENDAR), 
  calendarController.getCalendarEvents
);

/**
 * @route GET /api/v1/calendar/events/upcoming
 * @desc Get upcoming calendar events
 * @access Private
 */
router.get('/events/upcoming', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_CALENDAR), 
  calendarController.getUpcomingEvents
);

/**
 * @route GET /api/v1/calendar/events/:id
 * @desc Get calendar event by ID
 * @access Private
 */
router.get('/events/:id', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_CALENDAR), 
  calendarController.getCalendarEventById
);

/**
 * @route POST /api/v1/calendar/events
 * @desc Create new calendar event
 * @access Private
 */
router.post('/events', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_EVENTS), 
  calendarController.createCalendarEvent
);

/**
 * @route PUT /api/v1/calendar/events/:id
 * @desc Update calendar event
 * @access Private
 */
router.put('/events/:id', 
  authenticateToken, 
  authorizePermission(Permission.UPDATE_EVENTS), 
  calendarController.updateCalendarEvent
);

/**
 * @route DELETE /api/v1/calendar/events/:id
 * @desc Delete calendar event
 * @access Private
 */
router.delete('/events/:id', 
  authenticateToken, 
  authorizePermission(Permission.DELETE_EVENTS), 
  calendarController.deleteCalendarEvent
);

/**
 * @route POST /api/v1/calendar/events/check-conflicts
 * @desc Check for scheduling conflicts
 * @access Private
 */
router.post('/events/check-conflicts', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_EVENTS), 
  calendarController.checkSchedulingConflicts
);

export default router;