import { Request, Response } from 'express';
export declare const getTasks: (req: Request, res: Response) => Promise<void>;
export declare const getTaskById: (req: Request, res: Response) => Promise<any>;
export declare const createTask: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: Request, res: Response) => Promise<any>;
export declare const deleteTask: (req: Request, res: Response) => Promise<any>;
export declare const getTaskStats: (req: Request, res: Response) => Promise<void>;
export declare const startTaskTimer: (req: Request, res: Response) => Promise<any>;
export declare const stopTaskTimer: (req: Request, res: Response) => Promise<any>;
declare const _default: {
    getTasks: (req: Request, res: Response) => Promise<void>;
    getTaskById: (req: Request, res: Response) => Promise<any>;
    createTask: (req: Request, res: Response) => Promise<void>;
    updateTask: (req: Request, res: Response) => Promise<any>;
    deleteTask: (req: Request, res: Response) => Promise<any>;
    getTaskStats: (req: Request, res: Response) => Promise<void>;
    startTaskTimer: (req: Request, res: Response) => Promise<any>;
    stopTaskTimer: (req: Request, res: Response) => Promise<any>;
};
export default _default;
//# sourceMappingURL=taskController.d.ts.map