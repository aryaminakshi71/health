import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';

export enum TherapyType {
    ABA = 'ABA', // Applied Behavior Analysis
    SPEECH = 'SPEECH',
    OCCUPATIONAL = 'OCCUPATIONAL',
    PHYSIO = 'PHYSIO'
}

@Entity('therapy_sessions')
export class TherapySession {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    patientId!: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patientId' })
    patient!: Patient;

    @Column({
        type: 'enum',
        enum: TherapyType,
        default: TherapyType.ABA
    })
    type!: TherapyType;

    // Behavioral Assessment (simple scale 1-5 or text)
    @Column({ type: 'int', nullable: true })
    attentionSpanScore!: number;

    @Column({ type: 'int', nullable: true })
    socialInteractionScore!: number;

    @Column({ type: 'text', nullable: true })
    activitiesPerformed!: string;

    @Column({ type: 'text', nullable: true })
    progressNotes!: string;

    @Column({ type: 'text', nullable: true })
    homeworkAssigned!: string;

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
