import { z } from 'zod';

export const createDocumentSchema = z.object({
  clientId: z.string().uuid({ message: 'clientId harus berupa UUID yang valid' }),
  projectId: z.string().uuid({ message: 'projectId harus berupa UUID yang valid' }),
  amount: z.number().positive({ message: 'amount harus angka positif' }),
  itemsJson: z.string().min(1, { message: 'itemsJson wajib diisi' }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
