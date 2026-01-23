import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    medicineName!: string;

    @Column({ unique: true })
    batchNumber!: string;

    @Column({ type: 'int' })
    stock!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    pricePerUnit!: number;

    @Column({ type: 'date' })
    expiryDate!: Date;

    @Column({ nullable: true })
    manufacturer!: string;

    @Column({ nullable: true })
    hospitalId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
