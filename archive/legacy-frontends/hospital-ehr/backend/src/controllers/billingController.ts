import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Invoice, InvoiceStatus } from '../models/Invoice';
import { InvoiceItem } from '../models/InvoiceItem';
import { z } from 'zod';

const invoiceRepository = AppDataSource.getRepository(Invoice);

const createInvoiceSchema = z.object({
    patientId: z.string().uuid(),
    visitId: z.string().uuid().optional(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0)
    }))
});

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { patientId, visitId, items } = createInvoiceSchema.parse(req.body);

        const invoiceItems = items.map(item => {
            const i = new InvoiceItem();
            i.description = item.description;
            i.quantity = item.quantity;
            i.unitPrice = item.unitPrice;
            i.total = item.quantity * item.unitPrice;
            return i;
        });

        const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);

        const invoice = invoiceRepository.create({
            patientId,
            visitId,
            totalAmount,
            status: InvoiceStatus.PENDING,
            items: invoiceItems
        });

        await invoiceRepository.save(invoice);
        res.status(201).json(invoice);

    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating invoice' });
    }
};

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await invoiceRepository.find({
            relations: ['patient', 'items'],
            order: { createdAt: 'DESC' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
};
