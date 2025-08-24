export declare class CalendarService {
    private googleCalendar;
    private outlookCalendar;
    constructor();
    private initializeCalendars;
    createGoogleCalendarEvent(eventData: {
        summary: string;
        description?: string;
        start: {
            dateTime: string;
            timeZone: string;
        };
        end: {
            dateTime: string;
            timeZone: string;
        };
        attendees?: Array<{
            email: string;
            name?: string;
        }>;
        location?: string;
        reminders?: {
            useDefault: boolean;
            overrides?: Array<{
                method: string;
                minutes: number;
            }>;
        };
    }): Promise<any>;
    createOutlookCalendarEvent(eventData: {
        subject: string;
        body?: {
            contentType: string;
            content: string;
        };
        start: {
            dateTime: string;
            timeZone: string;
        };
        end: {
            dateTime: string;
            timeZone: string;
        };
        attendees?: Array<{
            emailAddress: {
                address: string;
                name?: string;
            };
            type: string;
        }>;
        location?: {
            displayName: string;
        };
        reminderMinutesBeforeStart?: number;
    }): Promise<any>;
    getGoogleCalendarEvents(params: {
        timeMin?: string;
        timeMax?: string;
        maxResults?: number;
        singleEvents?: boolean;
        orderBy?: string;
    }): Promise<any>;
    getOutlookCalendarEvents(params: {
        startDateTime?: string;
        endDateTime?: string;
        top?: number;
        orderBy?: string;
    }): Promise<any>;
    updateGoogleCalendarEvent(eventId: string, eventData: any): Promise<any>;
    updateOutlookCalendarEvent(eventId: string, eventData: any): Promise<any>;
    deleteGoogleCalendarEvent(eventId: string): Promise<any>;
    deleteOutlookCalendarEvent(eventId: string): Promise<any>;
    syncCalendarEvents(syncData: {
        source: 'google' | 'outlook';
        target: 'google' | 'outlook';
        events: Array<any>;
    }): Promise<any>;
    checkCalendarConflicts(eventData: {
        start: string;
        end: string;
        calendar: 'google' | 'outlook';
    }): Promise<any>;
}
export declare const calendarService: CalendarService;
//# sourceMappingURL=calendarService.d.ts.map