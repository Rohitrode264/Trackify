// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import type { Role } from '../types.js';

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: Role };
        }
    }
}
export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const token = header;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = { id: payload.id, role: payload.role };
        next();
    } catch (err) { return res.status(401).json({ message: 'Invalid token' }); }
}
export function authorize(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).end();
        if (!roles.includes(req.user.role)) return res.status(403).end();
        next();
    }
}
