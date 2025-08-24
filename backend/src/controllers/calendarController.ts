/**
 * Calendar Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for calendar and scheduling management including events, court dates, and reminders
 */

import { Request, Response } from 'express';
import DatabaseService from '@/services/DatabaseService';
import { authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Get calendar events with filtering and pagination
 * 
 * @route GET /api/v1/calendar/events
 * @access Private
 */
export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { 
      page = 1, 
      limit = 20, 
      search, 
      eventType, 
      status, 
      assignedTo, 
      caseId, 
      clientId,
      startDate,
      endDate
    } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('Fetching calendar events', { userId, filters: req.query });

    let events;
    let total = 0;

    // If date range is provided, use date range query
    if (startDate && endDate) {
      const result = await db.query(SQLQueries.CALENDAR_EVENTS.GET_BY_DATE_RANGE, [
        startDate,
        endDate,
        assignedTo || null,
        parseInt(limit as string),
        offset
      ]);
      events = result.rows;
      total = events.length; // For date range, we don't need pagination count
    } else {
      // Use search query with pagination
      const result = await db.query(SQLQueries.CALENDAR_EVENTS.SEARCH, [
        search || null,
        eventType || null,
        status || null,
        assignedTo || null,
        caseId || null,
        clientId || null,
        parseInt(limit as string),
        offset
      ]);
      events = result.rows;

      // Get total count for pagination
      const countResult = await db.query(`
        SELECT COUNT(*) as total
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
      `, [search || null, eventType || null, status || null, assignedTo || null, caseId || null, clientId || null]);
      total = parseInt(countResult.rows[0]?.total || '0');
    }

    const totalPages = Math.ceil(total / parseInt(limit as string));

    logger.info('Calendar events fetched successfully', { userId, count: events.length });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching calendar events', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALENDAR_EVENTS_FETCH_ERROR',
        message: 'Failed to fetch calendar events'
      }
    });
  }
};

/**
 * Get calendar event by ID
 * 
 * @route GET /api/v1/calendar/events/:id
 * @access Private
 */
export const getCalendarEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Fetching calendar event by ID', { userId, eventId: id });

    const result = await db.query(SQLQueries.CALENDAR_EVENTS.GET_BY_ID, [id]);
    const event = result.rows[0];

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CALENDAR_EVENT_NOT_FOUND',
          message: 'Calendar event not found'
        }
      });
    }

    // Get attendees
    const attendeesResult = await db.query(SQLQueries.CALENDAR_EVENT_ATTENDEES.GET_BY_EVENT_ID, [id]);
    const attendees = attendeesResult.rows;

    // Get reminders
    const remindersResult = await db.query(SQLQueries.CALENDAR_EVENT_REMINDERS.GET_BY_EVENT_ID, [id]);
    const reminders = remindersResult.rows;

    logger.info('Calendar event fetched successfully', { userId, eventId: id });

    res.json({
      success: true,
      data: {
        event: {
          ...event,
          attendees,
          reminders
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching calendar event', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALENDAR_EVENT_FETCH_ERROR',
        message: 'Failed to fetch calendar event'
      }
    });
  }
};

/**
 * Create new calendar event
 * 
 * @route POST /api/v1/calendar/events
 * @access Private
 */
export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const {
      title,
      description,
      eventType,
      startDatetime,
      endDatetime,
      allDay,
      location,
      caseId,
      clientId,
      assignedTo,
      status,
      priority,
      reminderMinutes,
      attendees,
      reminders
    } = req.body;

    logger.info('Creating new calendar event', { userId, title, eventType });

    // Check for scheduling conflicts
    if (assignedTo && startDatetime && endDatetime) {
      const conflictsResult = await db.query(SQLQueries.CALENDAR_EVENTS.GET_CONFLICTS, [
        assignedTo,
        startDatetime,
        endDatetime,
        null // No existing event ID for new events
      ]);
      
      if (conflictsResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SCHEDULING_CONFLICT',
            message: 'Scheduling conflict detected',
            data: { conflicts: conflictsResult.rows }
          }
        });
      }
    }

    // Create event
    const eventResult = await db.query(SQLQueries.CALENDAR_EVENTS.CREATE, [
      title,
      description,
      eventType,
      startDatetime,
      endDatetime,
      allDay || false,
      location,
      caseId || null,
      clientId || null,
      assignedTo || null,
      userId,
      status || 'scheduled',
      priority || 'medium',
      reminderMinutes || 15,
      null, // external_calendar_id
      null  // external_calendar_provider
    ]);

    const event = eventResult.rows[0];

    // Create attendees
    if (attendees && Array.isArray(attendees)) {
      for (const attendee of attendees) {
        await db.query(SQLQueries.CALENDAR_EVENT_ATTENDEES.CREATE, [
          event.id,
          attendee.userId || null,
          attendee.clientId || null,
          attendee.email,
          attendee.name,
          'pending'
        ]);
      }
    }

    // Create reminders
    if (reminders && Array.isArray(reminders)) {
      for (const reminder of reminders) {
        await db.query(SQLQueries.CALENDAR_EVENT_REMINDERS.CREATE, [
          event.id,
          reminder.type,
          reminder.time,
          reminder.email,
          reminder.phone,
          reminder.message
        ]);
      }
    }

    logger.businessEvent('calendar_event_created', 'calendar_event', event.id, userId);

    res.status(201).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    logger.error('Error creating calendar event', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALENDAR_EVENT_CREATE_ERROR',
        message: 'Failed to create calendar event'
      }
    });
  }
};

/**
 * Update calendar event
 * 
 * @route PUT /api/v1/calendar/events/:id
 * @access Private
 */
export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const {
      title,
      description,
      eventType,
      startDatetime,
      endDatetime,
      allDay,
      location,
      caseId,
      clientId,
      assignedTo,
      status,
      priority,
      reminderMinutes,
      attendees,
      reminders
    } = req.body;

    logger.info('Updating calendar event', { userId, eventId: id });

    // Get current event
    const currentResult = await db.query(SQLQueries.CALENDAR_EVENTS.GET_BY_ID, [id]);
    const currentEvent = currentResult.rows[0];

    if (!currentEvent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CALENDAR_EVENT_NOT_FOUND',
          message: 'Calendar event not found'
        }
      });
    }

    // Check for scheduling conflicts (excluding current event)
    if (assignedTo && startDatetime && endDatetime) {
      const conflictsResult = await db.query(SQLQueries.CALENDAR_EVENTS.GET_CONFLICTS, [
        assignedTo,
        startDatetime,
        endDatetime,
        id
      ]);
      
      if (conflictsResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SCHEDULING_CONFLICT',
            message: 'Scheduling conflict detected',
            data: { conflicts: conflictsResult.rows }
          }
        });
      }
    }

    // Update event
    const result = await db.query(SQLQueries.CALENDAR_EVENTS.UPDATE, [
      id,
      title || currentEvent.title,
      description || currentEvent.description,
      eventType || currentEvent.event_type,
      startDatetime || currentEvent.start_datetime,
      endDatetime || currentEvent.end_datetime,
      allDay !== undefined ? allDay : currentEvent.all_day,
      location || currentEvent.location,
      caseId || currentEvent.case_id,
      clientId || currentEvent.client_id,
      assignedTo || currentEvent.assigned_to,
      status || currentEvent.status,
      priority || currentEvent.priority,
      reminderMinutes || currentEvent.reminder_minutes,
      currentEvent.external_calendar_id,
      currentEvent.external_calendar_provider
    ]);

    const updatedEvent = result.rows[0];

    // Update attendees if provided
    if (attendees && Array.isArray(attendees)) {
      // Delete existing attendees
      await db.query(SQLQueries.CALENDAR_EVENT_ATTENDEES.DELETE_BY_EVENT_ID, [id]);
      
      // Create new attendees
      for (const attendee of attendees) {
        await db.query(SQLQueries.CALENDAR_EVENT_ATTENDEES.CREATE, [
          id,
          attendee.userId || null,
          attendee.clientId || null,
          attendee.email,
          attendee.name,
          attendee.responseStatus || 'pending'
        ]);
      }
    }

    // Update reminders if provided
    if (reminders && Array.isArray(reminders)) {
      // Delete existing reminders
      await db.query(SQLQueries.CALENDAR_EVENT_REMINDERS.DELETE_BY_EVENT_ID, [id]);
      
      // Create new reminders
      for (const reminder of reminders) {
        await db.query(SQLQueries.CALENDAR_EVENT_REMINDERS.CREATE, [
          id,
          reminder.type,
          reminder.time,
          reminder.email,
          reminder.phone,
          reminder.message
        ]);
      }
    }

    logger.businessEvent('calendar_event_updated', 'calendar_event', id, userId);

    res.json({
      success: true,
      data: { event: updatedEvent }
    });
  } catch (error) {
    logger.error('Error updating calendar event', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALENDAR_EVENT_UPDATE_ERROR',
        message: 'Failed to update calendar event'
      }
    });
  }
};

/**
 * Delete calendar event
 * 
 * @route DELETE /api/v1/calendar/events/:id
 * @access Private
 */
export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;

    logger.info('Deleting calendar event', { userId, eventId: id });

    // Check if event exists
    const currentResult = await db.query(SQLQueries.CALENDAR_EVENTS.GET_BY_ID, [id]);
    const event = currentResult.rows[0];

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CALENDAR_EVENT_NOT_FOUND',
          message: 'Calendar event not found'
        }
      });
    }

    // Delete event (cascade will delete attendees and reminders)
    await db.query(SQLQueries.CALENDAR_EVENTS.DELETE, [id]);

    logger.businessEvent('calendar_event_deleted', 'calendar_event', id, userId);

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting calendar event', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALENDAR_EVENT_DELETE_ERROR',
        message: 'Failed to delete calendar event'
      }
    });
  }
};

/**
 * Get upcoming events
 * 
 * @route GET /api/v1/calendar/events/upcoming
 * @access Private
 */
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { assignedTo, limit = 10 } = req.query;

    logger.info('Fetching upcoming events', { userId, assignedTo, limit });

    const result = await db.query(SQLQueries.CALENDAR_EVENTS.GET_UPCOMING, [
      assignedTo || null,
      parseInt(limit as string)
    ]);

    const events = result.rows;

    logger.info('Upcoming events fetched successfully', { userId, count: events.length });

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    logger.error('Error fetching upcoming events', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPCOMING_EVENTS_FETCH_ERROR',
        message: 'Failed to fetch upcoming events'
      }
    });
  }
};

/**
 * Check for scheduling conflicts
 * 
 * @route POST /api/v1/calendar/events/check-conflicts
 * @access Private
 */
export const checkSchedulingConflicts = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const { assignedTo, startDatetime, endDatetime, eventId } = req.body;

    logger.info('Checking scheduling conflicts', { userId, assignedTo, startDatetime, endDatetime });

    if (!assignedTo || !startDatetime || !endDatetime) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'assignedTo, startDatetime, and endDatetime are required'
        }
      });
    }

    const result = await db.query(SQLQueries.CALENDAR_EVENTS.GET_CONFLICTS, [
      assignedTo,
      startDatetime,
      endDatetime,
      eventId || null
    ]);

    const conflicts = result.rows;

    logger.info('Scheduling conflicts checked', { userId, conflictsCount: conflicts.length });

    res.json({
      success: true,
      data: { 
        conflicts,
        hasConflicts: conflicts.length > 0
      }
    });
  } catch (error) {
    logger.error('Error checking scheduling conflicts', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFLICT_CHECK_ERROR',
        message: 'Failed to check scheduling conflicts'
      }
    });
  }
};

export default {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUpcomingEvents,
  checkSchedulingConflicts
};