import { Request, Response } from 'express';
export declare const getCalendarEvents: (req: Request, res: Response) => Promise<void>;
export declare const getCalendarEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUpcomingEvents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkSchedulingConflicts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getCalendarEvents: (req: Request, res: Response) => Promise<void>;
    getCalendarEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getUpcomingEvents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    checkSchedulingConflicts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=calendarController.d.ts.map