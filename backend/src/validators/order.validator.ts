import { z } from 'zod';

// Valid order status transitions (State Machine)
export const ORDER_STATUS = ['UNPAID', 'PROCESS', 'PAID'] as const;
export type OrderStatus = typeof ORDER_STATUS[number];

// Valid transitions map
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  UNPAID: ['PROCESS'],
  PROCESS: ['PAID'],
  PAID: [],  // Terminal state — no further transitions
};

export const createOrderSchema = z.object({
  clientId: z.string().uuid({ message: 'clientId harus berupa UUID yang valid' }),
  total: z.number().positive({ message: 'total harus angka positif' }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['UNPAID', 'PROCESS', 'PAID'], {
    message: 'status harus UNPAID, PROCESS, atau PAID',
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
