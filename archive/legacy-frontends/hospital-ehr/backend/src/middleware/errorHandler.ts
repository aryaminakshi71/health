import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Structured error types
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, code: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
    }
}

// Structured error response
interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
    path: string;
}

// Audit logger for HIPAA compliance
const logError = (error: Error, req: Request) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: (req as any).user?.userId || 'anonymous',
        error: {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
    };
    
    // In production, send to structured logging service
    console.error(JSON.stringify(logEntry));
};

// Global error handler middleware
export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error for audit trail
    logError(error, req);

    const response: ErrorResponse = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        },
        timestamp: new Date().toISOString(),
        path: req.path
    };

    // Handle known error types
    if (error instanceof AppError) {
        response.error.code = error.code;
        response.error.message = error.message;
        return res.status(error.statusCode).json(response);
    }

    if (error instanceof ZodError) {
        response.error.code = 'VALIDATION_ERROR';
        response.error.message = 'Request validation failed';
        response.error.details = error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        return res.status(400).json(response);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        response.error.code = 'AUTH_ERROR';
        response.error.message = error.name === 'TokenExpiredError' 
            ? 'Token has expired' 
            : 'Invalid token';
        return res.status(401).json(response);
    }

    // Database errors
    if (error.name === 'QueryFailedError') {
        response.error.code = 'DATABASE_ERROR';
        response.error.message = 'Database operation failed';
        return res.status(500).json(response);
    }

    // Default: Internal server error
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'development') {
        response.error.message = error.message;
    }

    return res.status(500).json(response);
};

// Async handler wrapper to catch errors in async routes
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
    const response: ErrorResponse = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`
        },
        timestamp: new Date().toISOString(),
        path: req.path
    };
    res.status(404).json(response);
};
