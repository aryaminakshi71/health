import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export enum BloodGroup {
    A_POS = 'A+',
    A_NEG = 'A-',
    B_POS = 'B+',
    B_NEG = 'B-',
    O_POS = 'O+',
    O_NEG = 'O-',
    AB_POS = 'AB+',
    AB_NEG = 'AB-'
}

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    mrn!: string; // Medical Record Number

    @Column()
    firstName!: string;

    @Column({ nullable: true })
    lastName!: string;

    @Column({ type: 'date' })
    dateOfBirth!: Date;

    @Column({
        type: 'enum',
        enum: Gender
    })
    gender!: Gender;

    @Column()
    phone!: string;

    @Column({ nullable: true })
    email!: string;

    @Column({ type: 'text', nullable: true })
    address!: string;

    @Column({ nullable: true })
    city!: string;

    @Column({ nullable: true })
    state!: string;

    @Column({ nullable: true })
    pincode!: string;

    @Column()
    age!: number;

    @Column({ nullable: true })
    contactNumber!: string;

    @Column({
        type: 'enum',
        enum: BloodGroup,
        nullable: true
    })
    bloodGroup!: BloodGroup;

    @Column({ nullable: true })
    emergencyContactName!: string;

    @Column({ nullable: true })
    emergencyContactPhone!: string;

    // Medical Info (Simplified as text for MVP)
    @Column({ type: 'text', nullable: true })
    allergies!: string;

    @Column({ type: 'text', nullable: true })
    chronicConditions!: string;

    @Column({ unique: true, nullable: true })
    healthId!: string; // NDHM ID

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
