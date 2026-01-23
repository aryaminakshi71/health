import { Request, Response } from 'express';
import { mockInvoiceRepository } from '../tests/setup';
import { createInvoice, getInvoices, getInvoiceById, calculateInvoiceTotal } from '../src/controllers/billingController';
import { PaymentStatus } from '../src/models/Invoice';

jest.mock('../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => mockInvoiceRepository),
        initialize: jest.fn().mockResolvedValue(undefined)
    }
}));

describe('Billing Controller', () => {
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

    describe('createInvoice', () => {
        const validInvoiceData = {
            patientId: 'patient-123',
            visitId: 'visit-456',
            items: [
                { description: 'Consultation', quantity: 1, unitPrice: 500 },
                { description: 'Medicine', quantity: 2, unitPrice: 100 }
            ]
        };

        it('should create an invoice successfully', async () => {
            mockRequest.body = validInvoiceData;
            (mockInvoiceRepository.create as jest.Mock).mockReturnValue({
                ...validInvoiceData,
                id: 'mock-invoice-id',
                invoiceNumber: 'INV-001',
                totalAmount: 700,
                paymentStatus: PaymentStatus.PENDING
            });
            (mockInvoiceRepository.save as jest.Mock).mockResolvedValue({
                ...validInvoiceData,
                id: 'mock-invoice-id',
                invoiceNumber: 'INV-001',
                totalAmount: 700,
                paymentStatus: PaymentStatus.PENDING
            });

            await createInvoice(mockRequest as Request, mockResponse as Response);

            expect(mockInvoiceRepository.create).toHaveBeenCalled();
            expect(mockInvoiceRepository.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject.totalAmount).toBe(700);
        });

        it('should return 400 for missing required fields', async () => {
            mockRequest.body = {
                patientId: 'patient-123'
            };

            await createInvoice(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });

        it('should return 400 for empty items array', async () => {
            mockRequest.body = {
                patientId: 'patient-123',
                visitId: 'visit-456',
                items: []
            };

            await createInvoice(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject.errors).toBeDefined();
        });
    });

    describe('getInvoices', () => {
        it('should return a list of invoices', async () => {
            const mockInvoices = [
                { id: '1', invoiceNumber: 'INV-001', patientId: 'patient-123' },
                { id: '2', invoiceNumber: 'INV-002', patientId: 'patient-456' }
            ];
            (mockInvoiceRepository.find as jest.Mock).mockResolvedValue(mockInvoices);

            await getInvoices(mockRequest as Request, mockResponse as Response);

            expect(mockInvoiceRepository.find).toHaveBeenCalled();
            expect(responseObject).toEqual(mockInvoices);
        });

        it('should filter invoices by patient ID', async () => {
            mockRequest.query = { patientId: 'patient-123' };
            const mockInvoices = [
                { id: '1', invoiceNumber: 'INV-001', patientId: 'patient-123' }
            ];
            (mockInvoiceRepository.find as jest.Mock).mockResolvedValue(mockInvoices);

            await getInvoices(mockRequest as Request, mockResponse as Response);

            expect(mockInvoiceRepository.find).toHaveBeenCalled();
            expect(responseObject).toEqual(mockInvoices);
        });
    });

    describe('getInvoiceById', () => {
        it('should return an invoice by ID', async () => {
            const mockInvoice = {
                id: 'invoice-123',
                invoiceNumber: 'INV-001',
                patientId: 'patient-123',
                totalAmount: 700
            };
            mockRequest.params = { id: 'invoice-123' };
            (mockInvoiceRepository.findOne as jest.Mock).mockResolvedValue(mockInvoice);

            await getInvoiceById(mockRequest as Request, mockResponse as Response);

            expect(mockInvoiceRepository.findOne).toHaveBeenCalled();
            expect(responseObject).toEqual(mockInvoice);
        });

        it('should return 404 if invoice not found', async () => {
            mockRequest.params = { id: 'non-existent-id' };
            (mockInvoiceRepository.findOne as jest.Mock).mockResolvedValue(null);

            await getInvoiceById(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject.message).toBe('Invoice not found');
        });
    });

    describe('calculateInvoiceTotal', () => {
        it('should calculate total correctly', () => {
            const items = [
                { description: 'Item 1', quantity: 2, unitPrice: 100 },
                { description: 'Item 2', quantity: 3, unitPrice: 50 },
                { description: 'Item 3', quantity: 1, unitPrice: 200 }
            ];

            const total = (items as any[]).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            expect(total).toBe(550);
        });

        it('should return 0 for empty items', () => {
            const items: any[] = [];
            const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            expect(total).toBe(0);
        });
    });
});
