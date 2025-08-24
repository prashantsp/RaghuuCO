import { Request, Response } from 'express';
export declare const getCalendarEvents: (req: Request, res: Response) => Promise<void>;
export declare const getCalendarEventById: (req: Request, res: Response) => Promise<any>;
export declare const createCalendarEvent: (req: Request, res: Response) => Promise<any>;
export declare const updateCalendarEvent: (req: Request, res: Response) => Promise<any>;
export declare const deleteCalendarEvent: (req: Request, res: Response) => Promise<any>;
export declare const getUpcomingEvents: (req: Request, res: Response) => Promise<void>;
export declare const checkSchedulingConflicts: (req: Request, res: Response) => Promise<any>;
declare const _default: {
    getCalendarEvents: (req: Request, res: Response) => Promise<void>;
    getCalendarEventById: (req: Request, res: Response) => Promise<any>;
    createCalendarEvent: (req: Request, res: Response) => Promise<any>;
    updateCalendarEvent: (req: Request, res: Response) => Promise<any>;
    deleteCalendarEvent: (req: Request, res: Response) => Promise<any>;
    getUpcomingEvents: (req: Request, res: Response) => Promise<void>;
    checkSchedulingConflicts: (req: Request, res: Response) => Promise<any>;
};
export default _default;
//# sourceMappingURL=calendarController.d.ts.map