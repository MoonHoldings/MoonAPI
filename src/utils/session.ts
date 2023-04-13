import { Request, Response } from 'express';

export interface Session {
    req: Request;
    res: Response;
    payload?: { userId: String }
}

