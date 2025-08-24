import { Request, Response } from 'express';
export declare const getTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTaskById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTaskStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const startTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const stopTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getTaskById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getTaskStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    startTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    stopTaskTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=taskController.d.ts.map