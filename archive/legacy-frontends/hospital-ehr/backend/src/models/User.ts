import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    DOCTOR = 'doctor',
    NURSE = 'nurse',
    RECEPTIONIST = 'receptionist',
    LAB_TECHNICIAN = 'lab_technician',
    PHARMACIST = 'pharmacist'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string; // Hashed password

    @Column()
    name!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.RECEPTIONIST
    })
    role!: UserRole;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ nullable: true }) // Nullable for super-admins or initial setup
    hospitalId!: string;

    @ManyToOne('Hospital')
    @JoinColumn({ name: 'hospitalId' })
    hospital!: any;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
