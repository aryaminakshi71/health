import { Request, Response } from 'express';
import { createPatient, getPatients, getPatientById } from '../src/controllers/patientController';
import { mockPatientRepository } from '../tests/setup';
import { Patient, Gender, BloodGroup } from '../src/models/Patient';

jest.mock('../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => mockPatientRepository),
        initialize: jest.fn().mockResolvedValue(undefined)
    }
}));

describe('Patient Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        responseObject = {};
        mockRequest = {
            body: {},
            params: {}
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

    describe('createPatient', () => {
        const validPatientData = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-15',
            gender: 'MALE',
            phone: '1234567890',
            email: 'john@example.com',
            address: '123 Main St',
            city: 'New York',
            bloodGroup: 'O+'
        };

        it('should create a patient successfully', async () => {
            mockRequest.body = validPatientData;
            (mockPatientRepository.create as jest.Mock).mockReturnValue({
                ...validPatientData,
                id: 'mock-patient-id',
                mrn: 'MRN-12345678',
                dateOfBirth: new Date(validPatientData.dateOfBirth),
                gender: Gender.MALE,
                bloodGroup: BloodGroup.O_POS
            });
            (mockPatientRepository.save as jest.Mock).mockResolvedValue({
                ...validPatientData,
                id: 'mock-patient-id',
                mrn: 'MRN-12345678',
                dateOfBirth: new Date(validPatientData.dateOfBirth),
                gender: Gender.MALE,
                bloodGroup: BloodGroup.O_POS
            });

            await createPatient(mockRequest as Request, mockResponse as Response);

            expect(mockPatientRepository.create).toHaveBeenCalled();
            expect(mockPatientRepository.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject.mrn).toBeDefined();
        });

        it('should return 400 for missing required fields', async () => {
            mockRequest.body = {
                firstName: 'John'
            };

            await createPatient(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 400 for invalid gender', async () => {
            mockRequest.body = {
                ...validPatientData,
                gender: 'INVALID'
            };

            await createPatient(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 400 for invalid blood group', async () => {
            mockRequest.body = {
                ...validPatientData,
                bloodGroup: 'X+'
            };

            await createPatient(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 400 for invalid phone number', async () => {
            mockRequest.body = {
                ...validPatientData,
                phone: '123'
            };

            await createPatient(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 500 on server error', async () => {
            mockRequest.body = validPatientData;
            (mockPatientRepository.create as jest.Mock).mockImplementation(() => {
                throw new Error('Database error');
            });

            await createPatient(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe('Error creating patient');
        });
    });

    describe('getPatients', () => {
        it('should return a list of patients', async () => {
            const mockPatients = [
                { id: '1', firstName: 'John', lastName: 'Doe' },
                { id: '2', firstName: 'Jane', lastName: 'Smith' }
            ];
            (mockPatientRepository.find as jest.Mock).mockResolvedValue(mockPatients);

            await getPatients(mockRequest as Request, mockResponse as Response);

            expect(mockPatientRepository.find).toHaveBeenCalled();
            expect(mockPatientRepository.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
                take: 20
            });
            expect(responseObject).toEqual(mockPatients);
        });

        it('should return 500 on server error', async () => {
            (mockPatientRepository.find as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getPatients(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe('Error fetching patients');
        });
    });

    describe('getPatientById', () => {
        it('should return a patient by ID', async () => {
            const mockPatient = {
                id: 'patient-123',
                firstName: 'John',
                lastName: 'Doe',
                mrn: 'MRN-12345678'
            };
            mockRequest.params = { id: 'patient-123' };
            (mockPatientRepository.findOneBy as jest.Mock).mockResolvedValue(mockPatient);

            await getPatientById(mockRequest as Request, mockResponse as Response);

            expect(mockPatientRepository.findOneBy).toHaveBeenCalledWith({ id: 'patient-123' });
            expect(responseObject).toEqual(mockPatient);
        });

        it('should return 404 if patient not found', async () => {
            mockRequest.params = { id: 'non-existent-id' };
            (mockPatientRepository.findOneBy as jest.Mock).mockResolvedValue(null);

            await getPatientById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.message).toBe('Patient not found');
        });

        it('should return 500 on server error', async () => {
            mockRequest.params = { id: 'patient-123' };
            (mockPatientRepository.findOneBy as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getPatientById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(responseObject.message).toBe('Error fetching patient');
        });
    });
});
