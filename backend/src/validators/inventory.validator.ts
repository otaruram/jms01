import { z } from 'zod';

export const installProductSchema = z.object({
  productId: z.string().min(1, { message: 'productId wajib diisi' }),
  projectId: z.string().min(1, { message: 'projectId wajib diisi' }),
  qty: z.number().int().positive({ message: 'qty harus bilangan bulat positif' }),
});

export type InstallProductInput = z.infer<typeof installProductSchema>;
