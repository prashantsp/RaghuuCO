import { Request, Response } from 'express';
export declare const getCalendarEvents: (req: Request, res: Response) => Promise<void>;
export declare const getCalendarEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUpcomingEvents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const checkSchedulingConflicts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    getCalendarEvents: (req: Request, res: Response) => Promise<void>;
    getCalendarEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteCalendarEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUpcomingEvents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    checkSchedulingConflicts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=calendarController.d.ts.map