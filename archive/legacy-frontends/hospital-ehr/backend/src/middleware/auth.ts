import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

// Validate JWT_SECRET at startup
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }
    return secret;
};

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(
            token, 
            getJwtSecret()
        ) as { userId: string; role: string };
        
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof Error && error.message.includes('JWT_SECRET')) {
            console.error('CRITICAL: JWT_SECRET not configured properly');
            return res.status(500).json({
                message: 'Server configuration error',
                code: 'CONFIG_ERROR'
            });
        }
        return res.status(401).json({ 
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
        });
    }
};

export const roleMiddleware = (...allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Insufficient permissions',
                code: 'FORBIDDEN'
            });
        }
        
        next();
    };
};
