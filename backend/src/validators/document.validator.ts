import { z } from 'zod';

export const createDocumentSchema = z.object({
  clientId: z.string().min(1, { message: 'ID wajib diisi' }),
  projectId: z.string().min(1, { message: 'ID wajib diisi' }),
  amount: z.number().positive({ message: 'amount harus angka positif' }),
  itemsJson: z.string().min(1, { message: 'itemsJson wajib diisi' }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
