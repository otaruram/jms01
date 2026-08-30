import { z } from 'zod';

export const createTaxInvoiceSchema = z.object({
  body: z.object({
    invoiceNo: z.string().min(1, 'Nomor Faktur tidak boleh kosong'),
    clientId: z.string().uuid('Client ID tidak valid'),
    projectId: z.string().uuid('Project ID tidak valid').optional(),
    dppAmount: z.number().min(0, 'Nilai DPP tidak valid'),
    taxAmount: z.number().min(0, 'Nilai PPN tidak valid'),
    date: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const updateTaxInvoiceSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'ISSUED', 'PAID']).optional(),
  }),
});
