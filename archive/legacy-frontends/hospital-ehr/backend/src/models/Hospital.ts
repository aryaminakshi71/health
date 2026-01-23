import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hospitals')
export class Hospital {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    type!: string; // Multi-Specialty, Clinic, etc.

    @Column({ nullable: true })
    tier!: string; // Enterprise, Starter

    @Column({ default: 'ACTIVE' })
    subscriptionStatus!: string;

    @Column({ unique: true })
    domain!: string; // Subdomain e.g. apollo.ehr.com

    @Column({ nullable: true })
    address!: string;

    @Column({ nullable: true })
    contactEmail!: string;

    @Column({ nullable: true })
    phone!: string;

    @Column({ default: 'FREE' })
    subscriptionPlan!: string; // FREE, PRO, ENTERPRISE

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
