# Hospital EHR - Testing Guide

## Overview

This project includes comprehensive unit tests for the TypeScript backend using Jest. The tests cover authentication, patient management, visit tracking, and billing modules.

## Test Structure

```
backend/
├── tests/
│   ├── setup.ts              # Mock database and repository setup
│   ├── controllers/
│   │   ├── authController.test.ts
│   │   ├── patientController.test.ts
│   │   ├── visitController.test.ts
│   │   └── billingController.test.ts
│   └── models/
│       └── models.test.ts
├── jest.config.js
├── tsconfig.test.json
└── package.json
```

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Type check
npm run lint
```

## Test Coverage

### Auth Controller Tests
- User registration with valid/invalid data
- User login with correct/incorrect credentials
- Password validation
- Email format validation
- Error handling

### Patient Controller Tests
- Patient creation with required fields
- Patient retrieval (list and single)
- Validation for gender, blood group, phone
- Error handling

### Visit Controller Tests
- Visit creation
- Visit status updates
- Visit listing with filters
- Error handling

### Billing Controller Tests
- Invoice creation with items
- Invoice listing
- Invoice total calculation
- Payment status handling

## Writing New Tests

### Example Test Case

```typescript
import { Request, Response } from 'express';
import { createPatient } from '../src/controllers/patientController';
import { mockPatientRepository } from '../tests/setup';

describe('Patient Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockRequest = { body: {} };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should create a patient successfully', async () => {
        mockRequest.body = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-15',
            gender: 'MALE',
            phone: '1234567890'
        };

        await createPatient(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockPatientRepository.create).toHaveBeenCalled();
    });
});
```

## Mock Strategy

The tests use mocked repositories to avoid database connections:

```typescript
// Example mock setup in setup.ts
export const mockPatientRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((data) => ({ ...data, id: 'mock-id' })),
    save: jest.fn((data) => Promise.resolve({ ...data, id: 'mock-id' })),
    delete: jest.fn(),
};
```

## Continuous Integration

Add to your CI pipeline:

```yaml
- name: Run Tests
  run: |
    cd hospital-ehr/backend
    npm install
    npm test
    npm run test:coverage
```

## Coverage Requirements

- **Controllers**: Minimum 80% line coverage
- **Models**: Minimum 90% line coverage
- **Services**: Minimum 70% line coverage

## Best Practices

1. Each test should focus on one behavior
2. Use descriptive test names
3. Mock external dependencies
4. Test both success and error paths
5. Keep tests independent
6. Use beforeEach to reset mocks
