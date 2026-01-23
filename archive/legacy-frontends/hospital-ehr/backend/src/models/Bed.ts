import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum BedStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE',
    CLEANING = 'CLEANING'
}

export enum BedType {
    GENERAL = 'GENERAL',
    ICU = 'ICU',
    PRIVATE = 'PRIVATE',
    SEMIPRIVATE = 'SEMIPRIVATE',
    MATERNITY = 'MATERNITY'
}

@Entity('beds')
export class Bed {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    wardName!: string; // e.g., "General Ward", "ICU", "Maternity Ward"

    @Column()
    roomNumber!: string;

    @Column()
    bedNumber!: string;

    @Column({
        type: 'enum',
        enum: BedType,
        default: BedType.GENERAL
    })
    type!: BedType;

    @Column({
        type: 'enum',
        enum: BedStatus,
        default: BedStatus.AVAILABLE
    })
    status!: BedStatus;

    @Column({ nullable: true })
    currentAdmissionId!: string; // Points to active admission if occupied

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
