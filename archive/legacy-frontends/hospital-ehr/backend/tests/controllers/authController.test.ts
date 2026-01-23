import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { register, login } from '../src/controllers/authController';
import { mockUserRepository } from './setup';
import { AppDataSource } from '../src/config/database';
import { User, UserRole } from '../src/models/User';

jest.mock('../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => mockUserRepository),
        initialize: jest.fn().mockResolvedValue(undefined)
    }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        responseObject = {};
        mockRequest = {
            body: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((data) => {
                responseObject = data;
                return mockResponse;
            })
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        const validRegisterData = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'doctor'
        };

        it('should register a new user successfully', async () => {
            mockRequest.body = validRegisterData;
            (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(null);
            (mockUserRepository.create as jest.Mock).mockReturnValue({
                ...validRegisterData,
                password: 'hashed-password',
                id: 'mock-user-id'
            });
            (mockUserRepository.save as jest.Mock).mockResolvedValue({
                ...validRegisterData,
                password: 'hashed-password',
                id: 'mock-user-id'
            });
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: validRegisterData.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterData.password, 10);
            expect(mockUserRepository.create).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject.email).toBe(validRegisterData.email);
            expect(responseObject.password).toBeUndefined();
        });

        it('should return 400 if user already exists', async () => {
            mockRequest.body = validRegisterData;
            (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue({
                id: 'existing-user-id',
                email: validRegisterData.email
            });

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.message).toBe('User already exists');
        });

        it('should return 400 for invalid email', async () => {
            mockRequest.body = {
                email: 'invalid-email',
                password: 'password123',
                name: 'Test User'
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 400 for password too short', async () => {
            mockRequest.body = {
                email: 'test@example.com',
                password: '123',
                name: 'Test User'
            };

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 500 on server error', async () => {
            mockRequest.body = validRegisterData;
            (mockUserRepository.findOneBy as jest.Mock).mockRejectedValue(new Error('Database error'));

            await register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe('Internal server error');
        });
    });

    describe('login', () => {
        const validLoginData = {
            email: 'test@example.com',
            password: 'password123'
        };

        it('should login successfully with valid credentials', async () => {
            mockRequest.body = validLoginData;
            const mockUser = {
                id: 'mock-user-id',
                email: validLoginData.email,
                password: 'hashed-password',
                name: 'Test User',
                role: UserRole.DOCTOR,
                isActive: true
            };
            (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: validLoginData.email });
            expect(bcrypt.compare).toHaveBeenCalledWith(validLoginData.password, mockUser.password);
            expect(jwt.sign).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(responseObject.token).toBe('mock-jwt-token');
            expect(responseObject.user).toBeDefined();
        });

        it('should return 401 for non-existent user', async () => {
            mockRequest.body = validLoginData;
            (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(null);

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('Invalid credentials');
        });

        it('should return 401 for inactive user', async () => {
            mockRequest.body = validLoginData;
            (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue({
                id: 'mock-user-id',
                email: validLoginData.email,
                password: 'hashed-password',
                isActive: false
            });

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('Invalid credentials');
        });

        it('should return 401 for wrong password', async () => {
            mockRequest.body = validLoginData;
            (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue({
                id: 'mock-user-id',
                email: validLoginData.email,
                password: 'hashed-password',
                isActive: true
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseObject.message).toBe('Invalid credentials');
        });

        it('should return 400 for invalid email format', async () => {
            mockRequest.body = {
                email: 'invalid-email',
                password: 'password123'
            };

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 500 on server error', async () => {
            mockRequest.body = validLoginData;
            (mockUserRepository.findOneBy as jest.Mock).mockRejectedValue(new Error('Database error'));

            await login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe('Internal server error');
        });
    });
});
