import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';
import { Bed } from './Bed';

export enum AdmissionStatus {
    ADMITTED = 'ADMITTED',
    DISCHARGED = 'DISCHARGED'
}

@Entity('admissions')
export class Admission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    patientId!: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patientId' })
    patient!: Patient;

    @Column()
    bedId!: string;

    @ManyToOne(() => Bed)
    @JoinColumn({ name: 'bedId' })
    bed!: Bed;

    @Column({
        type: 'enum',
        enum: AdmissionStatus,
        default: AdmissionStatus.ADMITTED
    })
    status!: AdmissionStatus;

    @Column({ nullable: true })
    reasonForAdmission!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    admissionDate!: Date;

    @Column({ type: 'timestamp', nullable: true })
    dischargeDate!: Date;

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
