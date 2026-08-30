import { z } from 'zod';

export const installProductSchema = z.object({
  productId: z.string().min(1, { message: 'productId wajib diisi' }),
  projectId: z.string().min(1, { message: 'projectId wajib diisi' }),
  qty: z.number().int().positive({ message: 'qty harus bilangan bulat positif' }),
});

export const createProductSchema = z.object({
  name: z.string().min(1, { message: 'name wajib diisi' }),
  category: z.string().min(1, { message: 'category wajib diisi' }),
  stock: z.number().int().min(0, { message: 'stock tidak boleh negatif' }),
  unit: z.string().min(1, { message: 'unit wajib diisi' }),
  status: z.string().optional(),
});

export const addStockSchema = z.object({
  qty: z.number().int().positive({ message: 'qty harus bilangan bulat positif' }),
});

export type InstallProductInput = z.infer<typeof installProductSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type AddStockInput = z.infer<typeof addStockSchema>;
