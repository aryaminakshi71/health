import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

// SECURITY: synchronize should NEVER be true in production
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hospital_ehr',
    // SECURITY: Never auto-sync in production - use migrations instead
    synchronize: !isProduction && process.env.DB_SYNC === 'true',
    logging: !isProduction && process.env.DB_LOGGING === 'true',
    entities: ['src/models/**/*.ts'],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts'],
    // Connection pool settings for production
    extra: {
        max: parseInt(process.env.DB_POOL_SIZE || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    },
    // SSL configuration for production
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});
