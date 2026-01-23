import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';

@Entity('anc_visits')
export class ANCVisit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    patientId!: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patientId' })
    patient!: Patient;

    @Column()
    trimester!: number; // 1, 2, or 3

    @Column({ type: 'float', nullable: true })
    weight!: number;

    @Column({ type: 'text', nullable: true })
    bp!: string;

    @Column({ type: 'float', nullable: true })
    hemoglobin!: number;

    @Column({ type: 'date', nullable: true })
    nextVisitDate!: Date;

    @Column({ nullable: true })
    fetalHeartRate!: string;

    @Column({ type: 'text', nullable: true })
    fundalHeight!: string;

    @Column({ type: 'boolean', default: false })
    isHighRisk!: boolean;

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
