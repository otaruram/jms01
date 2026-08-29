import { z } from 'zod';

export const createSphSchema = z.object({
  clientId: z.string().uuid({ message: 'clientId harus berupa UUID' }),
  projectId: z.string().uuid({ message: 'projectId harus berupa UUID' }),
  subject: z.string().min(1, { message: 'subject wajib diisi' }),
  totalAmount: z.number().positive({ message: 'totalAmount harus positif' }),
  items: z.string().min(1, { message: 'items wajib diisi' }),
});

export const createBastSchema = z.object({
  clientId: z.string().uuid({ message: 'clientId harus berupa UUID' }),
  projectId: z.string().uuid({ message: 'projectId harus berupa UUID' }),
  description: z.string().min(1, { message: 'description wajib diisi' }),
});
