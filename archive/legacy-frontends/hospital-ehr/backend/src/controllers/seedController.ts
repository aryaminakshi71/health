import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Hospital } from '../models/Hospital';
import { User, UserRole } from '../models/User';
import { Patient, Gender, BloodGroup } from '../models/Patient';
import { Visit, VisitStatus } from '../models/Visit';
import { Bed, BedStatus, BedType } from '../models/Bed';
import { Inventory } from '../models/Inventory';
import { ANCVisit } from '../models/ANCVisit';
import { TherapySession, TherapyType } from '../models/TherapySession';
import { Admission, AdmissionStatus } from '../models/Admission';

export const seedDatabase = async (req: Request, res: Response) => {
    try {
        console.log('Starting seed...');

        // 1. Create Hospital
        let hospital = await AppDataSource.getRepository(Hospital).findOneBy({ domain: 'apollo.ehr.com' });
        if (!hospital) {
            hospital = new Hospital();
            hospital.name = "Apollo City Hospital";
            hospital.domain = "apollo.ehr.com"; // Add domain
            hospital.type = "Multi-Specialty";
            hospital.tier = "Enterprise";
            hospital.subscriptionStatus = "ACTIVE";
            hospital.address = "123 Health Ave";
            await AppDataSource.manager.save(hospital);
        }

        // 2. Create Patients
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

        // 3. Create OPD Visits
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

        // 4. Create Beds (IPD)
        for (let i = 1; i <= 10; i++) {
            const b = new Bed();
            b.wardName = i <= 5 ? "General Ward" : "ICU";
            b.roomNumber = `10${i}`;
            b.bedNumber = String.fromCharCode(65 + (i % 3));
            b.type = i <= 5 ? BedType.GENERAL : BedType.ICU;
            b.status = i <= 3 ? BedStatus.OCCUPIED : BedStatus.AVAILABLE;
            b.hospitalId = hospital.id;
            await AppDataSource.manager.save(b);

            if (i <= 3) {
                const adm = new Admission();
                adm.patient = patients[i + 5];
                adm.bed = b;
                adm.status = AdmissionStatus.ADMITTED;
                adm.hospitalId = hospital.id;
                await AppDataSource.manager.save(adm);

                b.currentAdmissionId = adm.id;
                await AppDataSource.manager.save(b);
            }
        }

        // 5. Inventory
        const meds = [
            { name: "Paracetamol 500mg", stock: 500, price: 2.5 },
            { name: "Amoxicillin 250mg", stock: 100, price: 15.0 },
            { name: "Metformin 500mg", stock: 200, price: 5.0 }
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

        res.json({ message: 'Database Seeded Successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Seeding failed', error });
    }
};
