import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`FATAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { 
        error: 'Too many requests', 
        message: 'Please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    message: {
        error: 'Too many login attempts',
        message: 'Please try again in 15 minutes',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(limiter); // Apply rate limiting globally

// Routes
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import visitRoutes from './routes/visitRoutes';
import saasRoutes from './routes/saasRoutes';
import ipdRoutes from './routes/ipdRoutes';
import specialtyRoutes from './routes/specialtyRoutes';
import billingRoutes from './routes/billingRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import { seedDatabase } from './controllers/seedController';

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/saas', saasRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/specialty', specialtyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

// SECURITY: Seed endpoint only available in development
if (process.env.NODE_ENV === 'development') {
    app.get('/api/test/seed', seedDatabase);
}

// Import error handlers
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Hospital EHR Backend' });
});

// 404 handler - must come after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start Server
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database initialized');

        app.listen(PORT, () => {
            console.log(`Hospital EHR Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to Database:', error);
        // Start server anyway for Mock Mode
        app.listen(PORT, () => {
             console.log(`[MOCK MODE] Hospital EHR Server running on port ${PORT}`);
        });
    }
};

startServer();

export default app;
