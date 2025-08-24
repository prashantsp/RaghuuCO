/**
 * Calendar Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for calendar integrations including Google Calendar and Outlook Calendar
 */

import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import logger from '@/utils/logger';

/**
 * Calendar Service Class
 * Handles calendar integrations with Google Calendar and Outlook Calendar
 */
export class CalendarService {
  private googleCalendar: any = null;
  private outlookCalendar: any = null;

  constructor() {
    this.initializeCalendars();
  }

  /**
   * Initialize calendar clients
   */
  private async initializeCalendars() {
    try {
      // Initialize Google Calendar
      if ((process as any).env.GOOGLE_CLIENT_ID && (process as any).env.GOOGLE_CLIENT_SECRET) {
        const auth = new google.auth.OAuth2(
          (process as any).env.GOOGLE_CLIENT_ID,
          (process as any).env.GOOGLE_CLIENT_SECRET,
          (process as any).env.GOOGLE_REDIRECT_URI
        );

        auth.setCredentials({
          refresh_token: (process as any).env.GOOGLE_REFRESH_TOKEN || null
        });

        this.googleCalendar = google.calendar({ version: 'v3', auth });
        logger.info('Google Calendar initialized successfully');
      }

      // Initialize Outlook Calendar
      if ((process as any).env.MICROSOFT_CLIENT_ID && (process as any).env.MICROSOFT_CLIENT_SECRET) {
        const auth = {
          clientId: (process as any).env.MICROSOFT_CLIENT_ID,
          clientSecret: (process as any).env.MICROSOFT_CLIENT_SECRET,
          tenantId: (process as any).env.MICROSOFT_TENANT_ID
        };

        this.outlookCalendar = Client.init({
          authProvider: (done: any) => {
            done(null, auth);
          }
        });

        logger.info('Outlook Calendar initialized successfully');
      }
    } catch (error) {
      logger.error('Error initializing calendar clients', error as Error);
    }
  }

  /**
   * Create Google Calendar event
   */
  async createGoogleCalendarEvent(eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: Array<{ email: string; name?: string }>;
    location?: string;
    reminders?: {
      useDefault: boolean;
      overrides?: Array<{ method: string; minutes: number }>;
    };
  }): Promise<any> {
    try {
      if (!this.googleCalendar) {
        throw new Error('Google Calendar not initialized');
      }

      logger.info('Creating Google Calendar event', { summary: eventData.summary });

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

      logger.info('Google Calendar event created successfully', { 
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
    } catch (error) {
      logger.error('Error creating Google Calendar event', error as Error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  /**
   * Create Outlook Calendar event
   */
  async createOutlookCalendarEvent(eventData: {
    subject: string;
    body?: { contentType: string; content: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: Array<{ emailAddress: { address: string; name?: string }; type: string }>;
    location?: { displayName: string };
    reminderMinutesBeforeStart?: number;
  }): Promise<any> {
    try {
      if (!this.outlookCalendar) {
        throw new Error('Outlook Calendar not initialized');
      }

      logger.info('Creating Outlook Calendar event', { subject: eventData.subject });

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

      logger.info('Outlook Calendar event created successfully', { 
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
    } catch (error) {
      logger.error('Error creating Outlook Calendar event', error as Error);
      throw new Error('Failed to create Outlook Calendar event');
    }
  }

  /**
   * Get Google Calendar events
   */
  async getGoogleCalendarEvents(params: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: string;
  }): Promise<any> {
    try {
      if (!this.googleCalendar) {
        throw new Error('Google Calendar not initialized');
      }

      logger.info('Getting Google Calendar events', params);

      const response = await this.googleCalendar.events.list({
        calendarId: 'primary',
        timeMin: params.timeMin || new Date().toISOString(),
        timeMax: params.timeMax,
        maxResults: params.maxResults || 10,
        singleEvents: params.singleEvents || true,
        orderBy: params.orderBy || 'startTime'
      });

      logger.info('Google Calendar events retrieved successfully', { 
        count: response.data.items.length 
      });

      return {
        success: true,
        data: {
          events: response.data.items,
          nextPageToken: response.data.nextPageToken
        }
      };
    } catch (error) {
      logger.error('Error getting Google Calendar events', error as Error);
      throw new Error('Failed to get Google Calendar events');
    }
  }

  /**
   * Get Outlook Calendar events
   */
  async getOutlookCalendarEvents(params: {
    startDateTime?: string;
    endDateTime?: string;
    top?: number;
    orderBy?: string;
  }): Promise<any> {
    try {
      if (!this.outlookCalendar) {
        throw new Error('Outlook Calendar not initialized');
      }

      logger.info('Getting Outlook Calendar events', params);

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

      logger.info('Outlook Calendar events retrieved successfully', { 
        count: response.value.length 
      });

      return {
        success: true,
        data: {
          events: response.value,
          nextLink: response['@odata.nextLink']
        }
      };
    } catch (error) {
      logger.error('Error getting Outlook Calendar events', error as Error);
      throw new Error('Failed to get Outlook Calendar events');
    }
  }

  /**
   * Update Google Calendar event
   */
  async updateGoogleCalendarEvent(eventId: string, eventData: any): Promise<any> {
    try {
      if (!this.googleCalendar) {
        throw new Error('Google Calendar not initialized');
      }

      logger.info('Updating Google Calendar event', { eventId });

      const response = await this.googleCalendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: eventData
      });

      logger.info('Google Calendar event updated successfully', { eventId });

      return {
        success: true,
        data: {
          eventId: response.data.id,
          updated: response.data.updated
        }
      };
    } catch (error) {
      logger.error('Error updating Google Calendar event', error as Error);
      throw new Error('Failed to update Google Calendar event');
    }
  }

  /**
   * Update Outlook Calendar event
   */
  async updateOutlookCalendarEvent(eventId: string, eventData: any): Promise<any> {
    try {
      if (!this.outlookCalendar) {
        throw new Error('Outlook Calendar not initialized');
      }

      logger.info('Updating Outlook Calendar event', { eventId });

      const response = await this.outlookCalendar
        .api(`/me/events/${eventId}`)
        .patch(eventData);

      logger.info('Outlook Calendar event updated successfully', { eventId });

      return {
        success: true,
        data: {
          eventId: response.id,
          updated: response.lastModifiedDateTime
        }
      };
    } catch (error) {
      logger.error('Error updating Outlook Calendar event', error as Error);
      throw new Error('Failed to update Outlook Calendar event');
    }
  }

  /**
   * Delete Google Calendar event
   */
  async deleteGoogleCalendarEvent(eventId: string): Promise<any> {
    try {
      if (!this.googleCalendar) {
        throw new Error('Google Calendar not initialized');
      }

      logger.info('Deleting Google Calendar event', { eventId });

      await this.googleCalendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      logger.info('Google Calendar event deleted successfully', { eventId });

      return {
        success: true,
        data: {
          eventId,
          deleted: true
        }
      };
    } catch (error) {
      logger.error('Error deleting Google Calendar event', error as Error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }

  /**
   * Delete Outlook Calendar event
   */
  async deleteOutlookCalendarEvent(eventId: string): Promise<any> {
    try {
      if (!this.outlookCalendar) {
        throw new Error('Outlook Calendar not initialized');
      }

      logger.info('Deleting Outlook Calendar event', { eventId });

      await this.outlookCalendar
        .api(`/me/events/${eventId}`)
        .delete();

      logger.info('Outlook Calendar event deleted successfully', { eventId });

      return {
        success: true,
        data: {
          eventId,
          deleted: true
        }
      };
    } catch (error) {
      logger.error('Error deleting Outlook Calendar event', error as Error);
      throw new Error('Failed to delete Outlook Calendar event');
    }
  }

  /**
   * Sync calendar events
   */
  async syncCalendarEvents(syncData: {
    source: 'google' | 'outlook';
    target: 'google' | 'outlook';
    events: Array<any>;
  }): Promise<any> {
    try {
      logger.info('Syncing calendar events', { 
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
          } else if (syncData.target === 'outlook') {
            const result = await this.createOutlookCalendarEvent(event);
            results.push(result);
          }
        } catch (error) {
          logger.error('Error syncing individual event', error as Error);
          results.push({ success: false, error: (error as any).message });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.info('Calendar sync completed', { 
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
    } catch (error) {
      logger.error('Error syncing calendar events', error as Error);
      throw new Error('Failed to sync calendar events');
    }
  }

  /**
   * Check calendar conflicts
   */
  async checkCalendarConflicts(eventData: {
    start: string;
    end: string;
    calendar: 'google' | 'outlook';
  }): Promise<any> {
    try {
      logger.info('Checking calendar conflicts', { 
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
      } else {
        const response = await this.getOutlookCalendarEvents({
          startDateTime: eventData.start,
          endDateTime: eventData.end
        });
        events = response.data.events;
      }

      const conflicts = events.filter((event: any) => {
        const eventStart = new Date(event.start.dateTime || event.start);
        const eventEnd = new Date(event.end.dateTime || event.end);
        const newStart = new Date(eventData.start);
        const newEnd = new Date(eventData.end);

        return (eventStart < newEnd && eventEnd > newStart);
      });

      logger.info('Calendar conflicts check completed', { 
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
    } catch (error) {
      logger.error('Error checking calendar conflicts', error as Error);
      throw new Error('Failed to check calendar conflicts');
    }
  }
}

// Export service instance
export const calendarService = new CalendarService();