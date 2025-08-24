"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSchedulingConflicts = exports.getUpcomingEvents = exports.deleteCalendarEvent = exports.updateCalendarEvent = exports.createCalendarEvent = exports.getCalendarEventById = exports.getCalendarEvents = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
const getCalendarEvents = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, search, eventType, status, assignedTo, caseId, clientId, startDate, endDate } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        logger_1.default.info('Fetching calendar events', { userId, filters: req.query });
        let events;
        let total = 0;
        if (startDate && endDate) {
            const result = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_BY_DATE_RANGE, [
                startDate,
                endDate,
                assignedTo || null,
                parseInt(limit),
                offset
            ]);
            events = result;
            total = events.length;
        }
        else {
            const result = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.SEARCH, [
                search || null,
                eventType || null,
                status || null,
                assignedTo || null,
                caseId || null,
                clientId || null,
                parseInt(limit),
                offset
            ]);
            events = result;
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
            total = parseInt(countResult[0]?.total || '0');
        }
        const totalPages = Math.ceil(total / parseInt(limit));
        logger_1.default.info('Calendar events fetched successfully', { userId, count: events.length });
        res.json({
            success: true,
            data: {
                events,
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
        logger_1.default.error('Error fetching calendar events', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CALENDAR_EVENTS_FETCH_ERROR',
                message: 'Failed to fetch calendar events'
            }
        });
    }
};
exports.getCalendarEvents = getCalendarEvents;
const getCalendarEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Fetching calendar event by ID', { userId, eventId: id });
        const result = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_BY_ID, [id]);
        const event = result[0];
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CALENDAR_EVENT_NOT_FOUND',
                    message: 'Calendar event not found'
                }
            });
        }
        const attendeesResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_ATTENDEES.GET_BY_EVENT_ID, [id]);
        const attendees = attendeesResult;
        const remindersResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_REMINDERS.GET_BY_EVENT_ID, [id]);
        const reminders = remindersResult;
        logger_1.default.info('Calendar event fetched successfully', { userId, eventId: id });
        return res.json({
            success: true,
            data: {
                event: {
                    ...event,
                    attendees,
                    reminders
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching calendar event', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CALENDAR_EVENT_FETCH_ERROR',
                message: 'Failed to fetch calendar event'
            }
        });
    }
};
exports.getCalendarEventById = getCalendarEventById;
const createCalendarEvent = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, description, eventType, startDatetime, endDatetime, allDay, location, caseId, clientId, assignedTo, status, priority, reminderMinutes, attendees, reminders } = req.body;
        logger_1.default.info('Creating new calendar event', { userId, title, eventType });
        if (assignedTo && startDatetime && endDatetime) {
            const conflictsResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_CONFLICTS, [
                assignedTo,
                startDatetime,
                endDatetime,
                null
            ]);
            if (conflictsResult.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'SCHEDULING_CONFLICT',
                        message: 'Scheduling conflict detected',
                        data: { conflicts: conflictsResult }
                    }
                });
            }
        }
        const eventResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.CREATE, [
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
            null,
            null
        ]);
        const event = eventResult[0];
        if (attendees && Array.isArray(attendees)) {
            for (const attendee of attendees) {
                await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_ATTENDEES.CREATE, [
                    event.id,
                    attendee.userId || null,
                    attendee.clientId || null,
                    attendee.email,
                    attendee.name,
                    'pending'
                ]);
            }
        }
        if (reminders && Array.isArray(reminders)) {
            for (const reminder of reminders) {
                await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_REMINDERS.CREATE, [
                    event.id,
                    reminder.type,
                    reminder.time,
                    reminder.email,
                    reminder.phone,
                    reminder.message
                ]);
            }
        }
        logger_1.default.businessEvent('calendar_event_created', 'calendar_event', event.id, userId);
        return res.status(201).json({
            success: true,
            data: { event }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating calendar event', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CALENDAR_EVENT_CREATE_ERROR',
                message: 'Failed to create calendar event'
            }
        });
    }
};
exports.createCalendarEvent = createCalendarEvent;
const updateCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { title, description, eventType, startDatetime, endDatetime, allDay, location, caseId, clientId, assignedTo, status, priority, reminderMinutes, attendees, reminders } = req.body;
        logger_1.default.info('Updating calendar event', { userId, eventId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_BY_ID, [id]);
        const currentEvent = currentResult[0];
        if (!currentEvent) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CALENDAR_EVENT_NOT_FOUND',
                    message: 'Calendar event not found'
                }
            });
        }
        if (assignedTo && startDatetime && endDatetime) {
            const conflictsResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_CONFLICTS, [
                assignedTo,
                startDatetime,
                endDatetime,
                id
            ]);
            if (conflictsResult.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'SCHEDULING_CONFLICT',
                        message: 'Scheduling conflict detected',
                        data: { conflicts: conflictsResult }
                    }
                });
            }
        }
        const result = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.UPDATE, [
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
        const updatedEvent = result[0];
        if (attendees && Array.isArray(attendees)) {
            await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_ATTENDEES.DELETE_BY_EVENT_ID, [id]);
            for (const attendee of attendees) {
                await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_ATTENDEES.CREATE, [
                    id,
                    attendee.userId || null,
                    attendee.clientId || null,
                    attendee.email,
                    attendee.name,
                    attendee.responseStatus || 'pending'
                ]);
            }
        }
        if (reminders && Array.isArray(reminders)) {
            await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_REMINDERS.DELETE_BY_EVENT_ID, [id]);
            for (const reminder of reminders) {
                await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENT_REMINDERS.CREATE, [
                    id,
                    reminder.type,
                    reminder.time,
                    reminder.email,
                    reminder.phone,
                    reminder.message
                ]);
            }
        }
        logger_1.default.businessEvent('calendar_event_updated', 'calendar_event', id || '', userId || '');
        return res.json({
            success: true,
            data: { event: updatedEvent }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating calendar event', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CALENDAR_EVENT_UPDATE_ERROR',
                message: 'Failed to update calendar event'
            }
        });
    }
};
exports.updateCalendarEvent = updateCalendarEvent;
const deleteCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        logger_1.default.info('Deleting calendar event', { userId, eventId: id });
        const currentResult = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_BY_ID, [id]);
        const event = currentResult[0];
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CALENDAR_EVENT_NOT_FOUND',
                    message: 'Calendar event not found'
                }
            });
        }
        await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.DELETE, [id]);
        logger_1.default.businessEvent('calendar_event_deleted', 'calendar_event', id || '', userId || '');
        return res.json({
            success: true,
            message: 'Calendar event deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error deleting calendar event', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CALENDAR_EVENT_DELETE_ERROR',
                message: 'Failed to delete calendar event'
            }
        });
    }
};
exports.deleteCalendarEvent = deleteCalendarEvent;
const getUpcomingEvents = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { assignedTo, limit = 10 } = req.query;
        logger_1.default.info('Fetching upcoming events', { userId, assignedTo, limit });
        const result = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_UPCOMING, [
            assignedTo || null,
            parseInt(limit)
        ]);
        const events = result;
        logger_1.default.info('Upcoming events fetched successfully', { userId, count: events.length });
        return res.json({
            success: true,
            data: { events }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching upcoming events', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'UPCOMING_EVENTS_FETCH_ERROR',
                message: 'Failed to fetch upcoming events'
            }
        });
    }
};
exports.getUpcomingEvents = getUpcomingEvents;
const checkSchedulingConflicts = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { assignedTo, startDatetime, endDatetime, eventId } = req.body;
        logger_1.default.info('Checking scheduling conflicts', { userId, assignedTo, startDatetime, endDatetime });
        if (!assignedTo || !startDatetime || !endDatetime) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_PARAMETERS',
                    message: 'assignedTo, startDatetime, and endDatetime are required'
                }
            });
        }
        const result = await db.query(db_SQLQueries_1.SQLQueries.CALENDAR_EVENTS.GET_CONFLICTS, [
            assignedTo,
            startDatetime,
            endDatetime,
            eventId || null
        ]);
        const conflicts = result;
        logger_1.default.info('Scheduling conflicts checked', { userId, conflictsCount: conflicts.length });
        return res.json({
            success: true,
            data: {
                conflicts,
                hasConflicts: conflicts.length > 0
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error checking scheduling conflicts', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CONFLICT_CHECK_ERROR',
                message: 'Failed to check scheduling conflicts'
            }
        });
    }
};
exports.checkSchedulingConflicts = checkSchedulingConflicts;
exports.default = {
    getCalendarEvents: exports.getCalendarEvents,
    getCalendarEventById: exports.getCalendarEventById,
    createCalendarEvent: exports.createCalendarEvent,
    updateCalendarEvent: exports.updateCalendarEvent,
    deleteCalendarEvent: exports.deleteCalendarEvent,
    getUpcomingEvents: exports.getUpcomingEvents,
    checkSchedulingConflicts: exports.checkSchedulingConflicts
};
//# sourceMappingURL=calendarController.js.map