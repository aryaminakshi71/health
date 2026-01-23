import { Request, Response } from 'express';
import { mockVisitRepository } from '../tests/setup';
import { createVisit, getVisits, getVisitById, updateVisitStatus } from '../src/controllers/visitController';
import { VisitStatus } from '../src/models/Visit';

jest.mock('../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => mockVisitRepository),
        initialize: jest.fn().mockResolvedValue(undefined)
    }
}));

describe('Visit Controller', () => {
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

    describe('createVisit', () => {
        const validVisitData = {
            patientId: 'patient-123',
            doctorId: 'doctor-456',
            visitType: 'OPD',
            chiefComplaint: 'Headache',
            symptoms: ['Headache', 'Nausea']
        };

        it('should create a visit successfully', async () => {
            mockRequest.body = validVisitData;
            (mockVisitRepository.create as jest.Mock).mockReturnValue({
                ...validVisitData,
                id: 'mock-visit-id',
                status: VisitStatus.REGISTERED,
                visitNumber: 'VIS-001'
            });
            (mockVisitRepository.save as jest.Mock).mockResolvedValue({
                ...validVisitData,
                id: 'mock-visit-id',
                status: VisitStatus.REGISTERED,
                visitNumber: 'VIS-001'
            });

            await createVisit(mockRequest as Request, mockResponse as Response);

            expect(mockVisitRepository.create).toHaveBeenCalled();
            expect(mockVisitRepository.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject.visitNumber).toBeDefined();
        });

        it('should return 400 for missing required fields', async () => {
            mockRequest.body = {
                patientId: 'patient-123'
            };

            await createVisit(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 400 for invalid visit type', async () => {
            mockRequest.body = {
                ...validVisitData,
                visitType: 'INVALID_TYPE'
            };

            await createVisit(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });
    });

    describe('getVisits', () => {
        it('should return a list of visits', async () => {
            const mockVisits = [
                { id: '1', visitNumber: 'VIS-001', patientId: 'patient-123' },
                { id: '2', visitNumber: 'VIS-002', patientId: 'patient-456' }
            ];
            (mockVisitRepository.find as jest.Mock).mockResolvedValue(mockVisits);

            await getVisits(mockRequest as Request, mockResponse as Response);

            expect(mockVisitRepository.find).toHaveBeenCalled();
            expect(responseObject).toEqual(mockVisits);
        });

        it('should filter visits by patient ID when provided', async () => {
            mockRequest.query = { patientId: 'patient-123' };
            const mockVisits = [
                { id: '1', visitNumber: 'VIS-001', patientId: 'patient-123' }
            ];
            (mockVisitRepository.find as jest.Mock).mockResolvedValue(mockVisits);

            await getVisits(mockRequest as Request, mockResponse as Response);

            expect(mockVisitRepository.find).toHaveBeenCalled();
            expect(responseObject).toEqual(mockVisits);
        });
    });

    describe('getVisitById', () => {
        it('should return a visit by ID', async () => {
            const mockVisit = {
                id: 'visit-123',
                visitNumber: 'VIS-001',
                patientId: 'patient-123'
            };
            mockRequest.params = { id: 'visit-123' };
            (mockVisitRepository.findOne as jest.Mock).mockResolvedValue(mockVisit);

            await getVisitById(mockRequest as Request, mockResponse as Response);

            expect(mockVisitRepository.findOne).toHaveBeenCalled();
            expect(responseObject).toEqual(mockVisit);
        });

        it('should return 404 if visit not found', async () => {
            mockRequest.params = { id: 'non-existent-id' };
            (mockVisitRepository.findOne as jest.Mock).mockResolvedValue(null);

            await getVisitById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.message).toBe('Visit not found');
        });
    });

    describe('updateVisitStatus', () => {
        it('should update visit status successfully', async () => {
            const mockVisit = {
                id: 'visit-123',
                visitNumber: 'VIS-001',
                status: VisitStatus.REGISTERED
            };
            mockRequest.params = { id: 'visit-123' };
            mockRequest.body = { status: 'IN_PROGRESS' };
            (mockVisitRepository.findOne as jest.Mock).mockResolvedValue(mockVisit);
            (mockVisitRepository.save as jest.Mock).mockResolvedValue({
                ...mockVisit,
                status: VisitStatus.IN_PROGRESS
            });

            await updateVisitStatus(mockRequest as Request, mockResponse as Response);

            expect(mockVisitRepository.save).toHaveBeenCalled();
            expect(responseObject.status).toBe(VisitStatus.IN_PROGRESS);
        });

        it('should return 404 if visit not found', async () => {
            mockRequest.params = { id: 'non-existent-id' };
            mockRequest.body = { status: 'IN_PROGRESS' };
            (mockVisitRepository.findOne as jest.Mock).mockResolvedValue(null);

            await updateVisitStatus(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.message).toBe('Visit not found');
        });

        it('should return 400 for invalid status', async () => {
            mockRequest.params = { id: 'visit-123' };
            mockRequest.body = { status: 'INVALID_STATUS' };

            await updateVisitStatus(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });
    });
});
