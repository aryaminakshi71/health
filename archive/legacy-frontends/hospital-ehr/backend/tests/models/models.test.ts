import { User, UserRole } from '../src/models/User';
import { Patient, Gender, BloodGroup } from '../src/models/Patient';
import { Visit, VisitStatus } from '../src/models/Visit';
import { Invoice, PaymentStatus } from '../src/models/Invoice';

describe('User Model', () => {
    it('should create a user with correct properties', () => {
        const user = new User();
        user.id = 'test-user-id';
        user.email = 'test@example.com';
        user.password = 'hashed-password';
        user.name = 'Test User';
        user.role = UserRole.DOCTOR;
        user.isActive = true;

        expect(user.email).toBe('test@example.com');
        expect(user.role).toBe(UserRole.DOCTOR);
        expect(user.isActive).toBe(true);
    });

    it('should have all UserRole values', () => {
        expect(UserRole.ADMIN).toBe('admin');
        expect(UserRole.DOCTOR).toBe('doctor');
        expect(UserRole.NURSE).toBe('nurse');
        expect(UserRole.RECEPTIONIST).toBe('receptionist');
        expect(UserRole.LAB_TECHNICIAN).toBe('lab_technician');
        expect(UserRole.PHARMACIST).toBe('pharmacist');
    });
});

describe('Patient Model', () => {
    it('should create a patient with correct properties', () => {
        const patient = new Patient();
        patient.id = 'test-patient-id';
        patient.mrn = 'MRN-12345678';
        patient.firstName = 'John';
        patient.lastName = 'Doe';
        patient.dateOfBirth = new Date('1990-01-15');
        patient.gender = Gender.MALE;
        patient.bloodGroup = BloodGroup.O_POS;
        patient.phone = '1234567890';

        expect(patient.firstName).toBe('John');
        expect(patient.gender).toBe(Gender.MALE);
        expect(patient.bloodGroup).toBe(BloodGroup.O_POS);
    });

    it('should have all BloodGroup values', () => {
        expect(BloodGroup.A_POS).toBe('A+');
        expect(BloodGroup.A_NEG).toBe('A-');
        expect(BloodGroup.B_POS).toBe('B+');
        expect(BloodGroup.B_NEG).toBe('B-');
        expect(BloodGroup.O_POS).toBe('O+');
        expect(BloodGroup.O_NEG).toBe('O-');
        expect(BloodGroup.AB_POS).toBe('AB+');
        expect(BloodGroup.AB_NEG).toBe('AB-');
    });
});

describe('Visit Model', () => {
    it('should create a visit with correct properties', () => {
        const visit = new Visit();
        visit.id = 'test-visit-id';
        visit.patientId = 'patient-123';
        visit.doctorId = 'doctor-456';
        visit.visitType = 'OPD';
        visit.status = VisitStatus.REGISTERED;
        visit.visitNumber = 'VIS-001';

        expect(visit.status).toBe(VisitStatus.REGISTERED);
        expect(visit.visitType).toBe('OPD');
    });

    it('should have all VisitStatus values', () => {
        expect(VisitStatus.REGISTERED).toBe('REGISTERED');
        expect(VisitStatus.IN_PROGRESS).toBe('IN_PROGRESS');
        expect(VisitStatus.COMPLETED).toBe('COMPLETED');
        expect(VisitStatus.CANCELLED).toBe('CANCELLED');
    });
});

describe('Invoice Model', () => {
    it('should create an invoice with correct properties', () => {
        const invoice = new Invoice();
        invoice.id = 'test-invoice-id';
        invoice.patientId = 'patient-123';
        invoice.visitId = 'visit-456';
        invoice.totalAmount = 1000;
        invoice.paymentStatus = PaymentStatus.PENDING;
        invoice.invoiceNumber = 'INV-001';

        expect(invoice.paymentStatus).toBe(PaymentStatus.PENDING);
        expect(invoice.totalAmount).toBe(1000);
    });

    it('should have all PaymentStatus values', () => {
        expect(PaymentStatus.PENDING).toBe('PENDING');
        expect(PaymentStatus.PAID).toBe('PAID');
        expect(PaymentStatus.CANCELLED).toBe('CANCELLED');
        expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
    });
});
