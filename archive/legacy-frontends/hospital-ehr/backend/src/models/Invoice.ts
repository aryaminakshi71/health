import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { InvoiceItem } from './InvoiceItem';
import { Patient } from './Patient';

export enum InvoiceStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    patientId!: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patientId' })
    patient!: Patient;

    @Column({ nullable: true })
    visitId!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.PENDING
    })
    status!: InvoiceStatus;

    @OneToMany(() => InvoiceItem, (item: InvoiceItem) => item.invoice, { cascade: true })
    items!: InvoiceItem[];

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
