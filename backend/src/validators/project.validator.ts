import { z } from 'zod';

export const addCapitalSchema = z.object({
  projectId: z.string().min(1, { message: 'ID wajib diisi' }),
  type: z.enum(['BARANG', 'AKOMODASI'], {
    message: 'type harus BARANG atau AKOMODASI',
  }),
  amount: z.number().positive({ message: 'amount harus angka positif' }),
  description: z.string().min(1, { message: 'description wajib diisi' }),
});

export type AddCapitalInput = z.infer<typeof addCapitalSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: 'Nama proyek wajib diisi' }),
  clientId: z.string().min(1, { message: 'ID Klien wajib diisi' }),
  totalCapital: z.number().min(0).default(0),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
