import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/models/User';
import { Patient, Gender, BloodGroup } from '../src/models/Patient';
import { Visit } from '../src/models/Visit';
import { Invoice } from '../src/models/Invoice';
import { InvoiceItem } from '../src/models/InvoiceItem';
import { Admission } from '../src/models/Admission';
import { Bed } from '../src/models/Bed';
import { Inventory } from '../src/models/Inventory';
import { Hospital } from '../src/models/Hospital';
import { TherapySession } from '../src/models/TherapySession';
import { ANCVisit } from '../src/models/ANCVisit';

jest.mock('../src/config/database', () => ({
    AppDataSource: {
        initialize: jest.fn().mockResolvedValue(undefined),
        getRepository: jest.fn((entity) => ({
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn((data) => ({ ...data, id: 'mock-id' })),
            save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-id' })),
            delete: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
        })),
        manager: {
            transaction: jest.fn(),
        }
    }
}));

export const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((data) => ({ ...data, id: 'mock-user-id' })),
    save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-user-id' })),
    delete: jest.fn(),
    count: jest.fn(),
};

export const mockPatientRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((data) => ({ 
        ...data, 
        id: 'mock-patient-id',
        mrn: `MRN-${Date.now().toString().slice(-8)}`
    })),
    save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-patient-id' })),
    delete: jest.fn(),
    count: jest.fn(),
};

export const mockVisitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((data) => ({ ...data, id: 'mock-visit-id' })),
    save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-visit-id' })),
    delete: jest.fn(),
    count: jest.fn(),
};

export const mockInvoiceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((data) => ({ ...data, id: 'mock-invoice-id' })),
    save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-invoice-id' })),
    delete: jest.fn(),
    count: jest.fn(),
};

export const mockAppDataSource = {
    initialize: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn((entity) => {
        if (entity === User) return mockUserRepository;
        if (entity === Patient) return mockPatientRepository;
        if (entity === Visit) return mockVisitRepository;
        if (entity === Invoice) return mockInvoiceRepository;
        return {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn((data) => ({ ...data, id: 'mock-id' })),
            save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-id' })),
            delete: jest.fn(),
        };
    }),
    manager: {
        transaction: jest.fn(),
    }
};
