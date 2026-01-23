import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Inventory } from '../models/Inventory';
import { z } from 'zod';

const inventoryRepository = AppDataSource.getRepository(Inventory);

// Schema for adding medicine
const addMedicineSchema = z.object({
    medicineName: z.string().min(2),
    batchNumber: z.string(),
    stock: z.number().int().positive(),
    pricePerUnit: z.number().positive(),
    expiryDate: z.string(), // ISO Date string
    manufacturer: z.string().optional()
});

export const addMedicine = async (req: Request, res: Response) => {
    try {
        const data = addMedicineSchema.parse(req.body);

        // Check if batch exists
        const existing = await inventoryRepository.findOneBy({ batchNumber: data.batchNumber });
        if (existing) {
            return res.status(400).json({ message: 'Batch already exists. Update stock instead.' });
        }

        const item = inventoryRepository.create({
            ...data,
            expiryDate: new Date(data.expiryDate)
        });
        await inventoryRepository.save(item);
        res.status(201).json(item);

    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error adding medicine' });
    }
};

export const getInventory = async (req: Request, res: Response) => {
    try {
        const items = await inventoryRepository.find({ order: { medicineName: 'ASC' } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory' });
    }
};

export const dispenseMedicine = async (req: Request, res: Response) => {
    try {
        const { id, quantity } = req.body;

        const item = await inventoryRepository.findOneBy({ id });
        if (!item) return res.status(404).json({ message: 'Medicine not found' });

        if (item.stock < quantity) {
            return res.status(400).json({ message: `Insufficient stock. Required: ${quantity}, Available: ${item.stock}` });
        }

        item.stock -= quantity;
        await inventoryRepository.save(item);

        res.json({ message: 'Dispensed successfully', remainingStock: item.stock });

    } catch (error) {
        res.status(500).json({ message: 'Error dispensing medicine' });
    }
};
