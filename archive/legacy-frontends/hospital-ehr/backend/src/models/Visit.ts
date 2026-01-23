import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';
import { User } from './User';

export enum VisitType {
    OPD = 'OPD',
    IPD = 'IPD',
    EMERGENCY = 'EMERGENCY',
    FOLLOW_UP = 'FOLLOW_UP'
}

export enum VisitStatus {
    REGISTERED = 'REGISTERED',
    WAITING = 'WAITING',
    IN_CONSULTATION = 'IN_CONSULTATION',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('visits')
export class Visit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'patient_id' })
    patientId!: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient!: Patient;

    @Column({
        type: 'enum',
        enum: VisitType,
        default: VisitType.OPD
    })
    type!: VisitType;

    @Column()
    doctorName!: string;

    @Column()
    department!: string;

    @Column({ nullable: true })
    symptoms!: string;

    @Column({
        type: 'enum',
        enum: VisitStatus,
        default: VisitStatus.WAITING
    })
    status!: VisitStatus;

    @Column({ type: 'text', nullable: true })
    chiefComplaint!: string;

    // Assigned Doctor
    @Column({ name: 'doctor_id', nullable: true })
    doctorId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'doctor_id' })
    doctor!: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    visitDate!: Date;

    // Vitals (Simplified json for MVP or separate columns)
    @Column({ type: 'jsonb', nullable: true })
    vitals!: {
        bp?: string;
        temperature?: string;
        weight?: string;
        pulse?: string;
    };

    @Column({ type: 'text', nullable: true })
    diagnosis!: string;

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
