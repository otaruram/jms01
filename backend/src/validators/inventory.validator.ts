import { z } from 'zod';

export const installProductSchema = z.object({
  productId: z.string().uuid({ message: 'productId harus berupa UUID yang valid' }),
  projectId: z.string().uuid({ message: 'projectId harus berupa UUID yang valid' }),
  qty: z.number().int().positive({ message: 'qty harus bilangan bulat positif' }),
});

export type InstallProductInput = z.infer<typeof installProductSchema>;
