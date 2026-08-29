import { z } from 'zod';

export const addCapitalSchema = z.object({
  projectId: z.string().uuid({ message: 'projectId harus berupa UUID yang valid' }),
  type: z.enum(['BARANG', 'AKOMODASI'], {
    message: 'type harus BARANG atau AKOMODASI',
  }),
  amount: z.number().positive({ message: 'amount harus angka positif' }),
  description: z.string().min(1, { message: 'description wajib diisi' }),
});

export type AddCapitalInput = z.infer<typeof addCapitalSchema>;
