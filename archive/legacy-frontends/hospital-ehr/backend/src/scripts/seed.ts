import { AppDataSource } from '../config/database';
import { Hospital } from '../models/Hospital';
import { User, UserRole } from '../models/User';
import { Patient, Gender, BloodGroup } from '../models/Patient';
import { Visit, VisitStatus } from '../models/Visit';
import { Bed, BedStatus, BedType } from '../models/Bed';
import { Inventory } from '../models/Inventory';
import { ANCVisit } from '../models/ANCVisit';
import { TherapySession, TherapyType } from '../models/TherapySession';
import { Invoice, InvoiceStatus } from '../models/Invoice';
import { InvoiceItem } from '../models/InvoiceItem';
import { Admission, AdmissionStatus } from '../models/Admission';

const seed = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected for seeding...');

        // 1. Create Hospital
        const hospital = new Hospital();
        hospital.name = "Apollo City Hospital";
        hospital.type = "Multi-Specialty";
        hospital.tier = "Enterprise";
        hospital.subscriptionStatus = "ACTIVE";
        await AppDataSource.manager.save(hospital);
        console.log('Created Hospital:', hospital.name);

        // 2. Create Admin User
        const admin = new User();
        admin.name = "Dr. Arya Admin";
        admin.email = "admin@apollo.com";
        admin.password = "password123"; // In real app, hash this!
        admin.role = UserRole.ADMIN;
        admin.hospital = hospital;
        await AppDataSource.manager.save(admin);

        // 3. Create Patients (Mock Data)
        const patients = [];
        for (let i = 1; i <= 10; i++) {
            const p = new Patient();
            p.firstName = `Patient${i}`;
            p.lastName = "Demo";
            p.age = 20 + i;
            p.gender = i % 2 === 0 ? Gender.FEMALE : Gender.MALE;
            p.contactNumber = `987654321${i}`;
            p.bloodGroup = BloodGroup.O_POS;
            p.hospitalId = hospital.id;
            await AppDataSource.manager.save(p);
            patients.push(p);
        }
        console.log('Created 10 Patients');

        // 4. Create OPD Visits
        for (let i = 0; i < 5; i++) {
            const v = new Visit();
            v.patient = patients[i];
            v.doctorName = "Dr. Smith";
            v.department = "General";
            v.status = i === 0 ? VisitStatus.IN_CONSULTATION : VisitStatus.WAITING;
            v.symptoms = "Fever, Cough";
            v.hospitalId = hospital.id;
            await AppDataSource.manager.save(v);
        }
        console.log('Created OPD Visits');

        // 5. Create Beds (IPD)
        const beds = [];
        for (let i = 1; i <= 10; i++) {
            const b = new Bed();
            b.wardName = i <= 5 ? "General Ward" : "ICU";
            b.roomNumber = `10${i}`;
            b.bedNumber = String.fromCharCode(65 + (i % 3)); // A, B, C...
            b.type = i <= 5 ? BedType.GENERAL : BedType.ICU;
            b.status = i <= 3 ? BedStatus.OCCUPIED : BedStatus.AVAILABLE;
            b.hospitalId = hospital.id;
            await AppDataSource.manager.save(b);
            beds.push(b);

            // Admit some patients
            if (i <= 3) {
                const adm = new Admission();
                adm.patient = patients[i + 5]; // Use different patients
                adm.bed = b;
                adm.status = AdmissionStatus.ADMITTED;
                adm.hospitalId = hospital.id;
                await AppDataSource.manager.save(adm);

                b.currentAdmissionId = adm.id;
                await AppDataSource.manager.save(b);
            }
        }
        console.log('Created Beds & Admissions');

        // 6. Pharmacy Inventory
        const meds = [
            { name: "Paracetamol 500mg", stock: 500, price: 2.5 },
            { name: "Amoxicillin 250mg", stock: 100, price: 15.0 },
            { name: "Metformin 500mg", stock: 200, price: 5.0 },
            { name: "Cetirizine 10mg", stock: 300, price: 3.0 }
        ];

        for (const m of meds) {
            const inv = new Inventory();
            inv.medicineName = m.name;
            inv.batchNumber = `BATCH-${Math.floor(Math.random() * 10000)}`;
            inv.stock = m.stock;
            inv.pricePerUnit = m.price;
            inv.expiryDate = new Date('2026-12-31');
            inv.hospitalId = hospital.id;
            await AppDataSource.manager.save(inv);
        }
        console.log('Created Pharmacy Inventory');

        // 7. Maternal & Autism Data
        const matVisit = new ANCVisit();
        matVisit.patient = patients[0]; // Female patient
        matVisit.trimester = 2;
        matVisit.weight = 65;
        matVisit.bp = "120/80";
        matVisit.hospitalId = hospital.id;
        await AppDataSource.manager.save(matVisit);

        const autismSession = new TherapySession();
        autismSession.patient = patients[1];
        autismSession.type = TherapyType.ABA;
        autismSession.activitiesPerformed = "Social Interaction Games";
        autismSession.progressNotes = "Improved eye contact";
        autismSession.hospitalId = hospital.id;
        await AppDataSource.manager.save(autismSession);

        console.log('Seeding Complete! Press Ctrl+C to exit.');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

seed();
