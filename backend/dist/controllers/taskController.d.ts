import { Request, Response } from 'express';
export declare const getTasks: (req: Request, res: Response) => Promise<void>;
export declare const getTaskById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTask: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTaskStats: (req: Request, res: Response) => Promise<void>;
export declare const startTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const stopTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    getTasks: (req: Request, res: Response) => Promise<void>;
    getTaskById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createTask: (req: Request, res: Response) => Promise<void>;
    updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getTaskStats: (req: Request, res: Response) => Promise<void>;
    startTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    stopTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=taskController.d.ts.map