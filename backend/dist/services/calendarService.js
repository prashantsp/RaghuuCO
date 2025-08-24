"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarService = exports.CalendarService = void 0;
const googleapis_1 = require("googleapis");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const logger_1 = __importDefault(require("@/utils/logger"));
class CalendarService {
    constructor() {
        this.googleCalendar = null;
        this.outlookCalendar = null;
        this.initializeCalendars();
    }
    async initializeCalendars() {
        try {
            if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
                const auth = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
                auth.setCredentials({
                    refresh_token: process.env.GOOGLE_REFRESH_TOKEN || null
                });
                this.googleCalendar = googleapis_1.google.calendar({ version: 'v3', auth });
                logger_1.default.info('Google Calendar initialized successfully');
            }
            if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
                const auth = {
                    clientId: process.env.MICROSOFT_CLIENT_ID,
                    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                    tenantId: process.env.MICROSOFT_TENANT_ID
                };
                this.outlookCalendar = microsoft_graph_client_1.Client.init({
                    authProvider: (done) => {
                        done(null, auth);
                    }
                });
                logger_1.default.info('Outlook Calendar initialized successfully');
            }
        }
        catch (error) {
            logger_1.default.error('Error initializing calendar clients', error);
        }
    }
    async createGoogleCalendarEvent(eventData) {
        try {
            if (!this.googleCalendar) {
                throw new Error('Google Calendar not initialized');
            }
            logger_1.default.info('Creating Google Calendar event', { summary: eventData.summary });
            const event = {
                summary: eventData.summary,
                description: eventData.description,
                start: eventData.start,
                end: eventData.end,
                attendees: eventData.attendees,
                location: eventData.location,
                reminders: eventData.reminders
            };
            const response = await this.googleCalendar.events.insert({
                calendarId: 'primary',
                resource: event
            });
            logger_1.default.info('Google Calendar event created successfully', {
                eventId: response.data.id
            });
            return {
                success: true,
                data: {
                    eventId: response.data.id,
                    htmlLink: response.data.htmlLink,
                    start: response.data.start,
                    end: response.data.end
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating Google Calendar event', error);
            throw new Error('Failed to create Google Calendar event');
        }
    }
    async createOutlookCalendarEvent(eventData) {
        try {
            if (!this.outlookCalendar) {
                throw new Error('Outlook Calendar not initialized');
            }
            logger_1.default.info('Creating Outlook Calendar event', { subject: eventData.subject });
            const event = {
                subject: eventData.subject,
                body: eventData.body,
                start: eventData.start,
                end: eventData.end,
                attendees: eventData.attendees,
                location: eventData.location,
                reminderMinutesBeforeStart: eventData.reminderMinutesBeforeStart
            };
            const response = await this.outlookCalendar
                .api('/me/events')
                .post(event);
            logger_1.default.info('Outlook Calendar event created successfully', {
                eventId: response.id
            });
            return {
                success: true,
                data: {
                    eventId: response.id,
                    webLink: response.webLink,
                    start: response.start,
                    end: response.end
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating Outlook Calendar event', error);
            throw new Error('Failed to create Outlook Calendar event');
        }
    }
    async getGoogleCalendarEvents(params) {
        try {
            if (!this.googleCalendar) {
                throw new Error('Google Calendar not initialized');
            }
            logger_1.default.info('Getting Google Calendar events', params);
            const response = await this.googleCalendar.events.list({
                calendarId: 'primary',
                timeMin: params.timeMin || new Date().toISOString(),
                timeMax: params.timeMax,
                maxResults: params.maxResults || 10,
                singleEvents: params.singleEvents || true,
                orderBy: params.orderBy || 'startTime'
            });
            logger_1.default.info('Google Calendar events retrieved successfully', {
                count: response.data.items.length
            });
            return {
                success: true,
                data: {
                    events: response.data.items,
                    nextPageToken: response.data.nextPageToken
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting Google Calendar events', error);
            throw new Error('Failed to get Google Calendar events');
        }
    }
    async getOutlookCalendarEvents(params) {
        try {
            if (!this.outlookCalendar) {
                throw new Error('Outlook Calendar not initialized');
            }
            logger_1.default.info('Getting Outlook Calendar events', params);
            let query = this.outlookCalendar.api('/me/events');
            if (params.startDateTime) {
                query = query.filter(`start/dateTime ge '${params.startDateTime}'`);
            }
            if (params.endDateTime) {
                query = query.filter(`end/dateTime le '${params.endDateTime}'`);
            }
            if (params.top) {
                query = query.top(params.top);
            }
            if (params.orderBy) {
                query = query.orderBy(params.orderBy);
            }
            const response = await query.get();
            logger_1.default.info('Outlook Calendar events retrieved successfully', {
                count: response.value.length
            });
            return {
                success: true,
                data: {
                    events: response.value,
                    nextLink: response['@odata.nextLink']
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting Outlook Calendar events', error);
            throw new Error('Failed to get Outlook Calendar events');
        }
    }
    async updateGoogleCalendarEvent(eventId, eventData) {
        try {
            if (!this.googleCalendar) {
                throw new Error('Google Calendar not initialized');
            }
            logger_1.default.info('Updating Google Calendar event', { eventId });
            const response = await this.googleCalendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: eventData
            });
            logger_1.default.info('Google Calendar event updated successfully', { eventId });
            return {
                success: true,
                data: {
                    eventId: response.data.id,
                    updated: response.data.updated
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error updating Google Calendar event', error);
            throw new Error('Failed to update Google Calendar event');
        }
    }
    async updateOutlookCalendarEvent(eventId, eventData) {
        try {
            if (!this.outlookCalendar) {
                throw new Error('Outlook Calendar not initialized');
            }
            logger_1.default.info('Updating Outlook Calendar event', { eventId });
            const response = await this.outlookCalendar
                .api(`/me/events/${eventId}`)
                .patch(eventData);
            logger_1.default.info('Outlook Calendar event updated successfully', { eventId });
            return {
                success: true,
                data: {
                    eventId: response.id,
                    updated: response.lastModifiedDateTime
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error updating Outlook Calendar event', error);
            throw new Error('Failed to update Outlook Calendar event');
        }
    }
    async deleteGoogleCalendarEvent(eventId) {
        try {
            if (!this.googleCalendar) {
                throw new Error('Google Calendar not initialized');
            }
            logger_1.default.info('Deleting Google Calendar event', { eventId });
            await this.googleCalendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
            logger_1.default.info('Google Calendar event deleted successfully', { eventId });
            return {
                success: true,
                data: {
                    eventId,
                    deleted: true
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error deleting Google Calendar event', error);
            throw new Error('Failed to delete Google Calendar event');
        }
    }
    async deleteOutlookCalendarEvent(eventId) {
        try {
            if (!this.outlookCalendar) {
                throw new Error('Outlook Calendar not initialized');
            }
            logger_1.default.info('Deleting Outlook Calendar event', { eventId });
            await this.outlookCalendar
                .api(`/me/events/${eventId}`)
                .delete();
            logger_1.default.info('Outlook Calendar event deleted successfully', { eventId });
            return {
                success: true,
                data: {
                    eventId,
                    deleted: true
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error deleting Outlook Calendar event', error);
            throw new Error('Failed to delete Outlook Calendar event');
        }
    }
    async syncCalendarEvents(syncData) {
        try {
            logger_1.default.info('Syncing calendar events', {
                source: syncData.source,
                target: syncData.target,
                eventCount: syncData.events.length
            });
            const results = [];
            for (const event of syncData.events) {
                try {
                    if (syncData.target === 'google') {
                        const result = await this.createGoogleCalendarEvent(event);
                        results.push(result);
                    }
                    else if (syncData.target === 'outlook') {
                        const result = await this.createOutlookCalendarEvent(event);
                        results.push(result);
                    }
                }
                catch (error) {
                    logger_1.default.error('Error syncing individual event', error);
                    results.push({ success: false, error: error.message });
                }
            }
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            logger_1.default.info('Calendar sync completed', {
                successful,
                failed,
                total: results.length
            });
            return {
                success: true,
                data: {
                    totalEvents: results.length,
                    successful,
                    failed,
                    results
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error syncing calendar events', error);
            throw new Error('Failed to sync calendar events');
        }
    }
    async checkCalendarConflicts(eventData) {
        try {
            logger_1.default.info('Checking calendar conflicts', {
                start: eventData.start,
                end: eventData.end,
                calendar: eventData.calendar
            });
            let events;
            if (eventData.calendar === 'google') {
                const response = await this.getGoogleCalendarEvents({
                    timeMin: eventData.start,
                    timeMax: eventData.end
                });
                events = response.data.events;
            }
            else {
                const response = await this.getOutlookCalendarEvents({
                    startDateTime: eventData.start,
                    endDateTime: eventData.end
                });
                events = response.data.events;
            }
            const conflicts = events.filter((event) => {
                const eventStart = new Date(event.start.dateTime || event.start);
                const eventEnd = new Date(event.end.dateTime || event.end);
                const newStart = new Date(eventData.start);
                const newEnd = new Date(eventData.end);
                return (eventStart < newEnd && eventEnd > newStart);
            });
            logger_1.default.info('Calendar conflicts check completed', {
                conflictsFound: conflicts.length
            });
            return {
                success: true,
                data: {
                    hasConflicts: conflicts.length > 0,
                    conflicts,
                    conflictCount: conflicts.length
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error checking calendar conflicts', error);
            throw new Error('Failed to check calendar conflicts');
        }
    }
}
exports.CalendarService = CalendarService;
exports.calendarService = new CalendarService();
//# sourceMappingURL=calendarService.js.map