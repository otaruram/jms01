import { z } from 'zod';

export const createTaxInvoiceSchema = z.object({
  invoiceNo: z.string().min(1, 'Nomor Faktur tidak boleh kosong'),
  clientId: z.string().min(1, 'Client ID tidak boleh kosong'),
  projectId: z.string().optional(),
  dppAmount: z.number().min(0, 'Nilai DPP tidak valid'),
  taxAmount: z.number().min(0, 'Nilai PPN tidak valid'),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const updateTaxInvoiceSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'PAID']).optional(),
});
