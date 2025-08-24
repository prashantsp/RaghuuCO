import { Request, Response } from 'express';
export declare const registerClientUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginClientUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logoutClientUser: (req: Request, res: Response) => Promise<void>;
export declare const getClientCases: (req: Request, res: Response) => Promise<void>;
export declare const getClientCaseDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getClientMessages: (req: Request, res: Response) => Promise<void>;
export declare const sendClientMessage: (req: Request, res: Response) => Promise<void>;
export declare const updateClientProfile: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    registerClientUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    loginClientUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    logoutClientUser: (req: Request, res: Response) => Promise<void>;
    getClientCases: (req: Request, res: Response) => Promise<void>;
    getClientCaseDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getClientMessages: (req: Request, res: Response) => Promise<void>;
    sendClientMessage: (req: Request, res: Response) => Promise<void>;
    updateClientProfile: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=clientPortalController.d.ts.map