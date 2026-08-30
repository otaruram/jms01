import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export const userContext = new AsyncLocalStorage<{ userId: string; role: string }>();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'], // reduced logging for prod
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const ctx = userContext.getStore();
        const modelsWithUser = [
          'Product',
          'Client',
          'Project',
          'Order',
          'DocumentMaster',
          'Sph',
          'Bast',
          'Expense',
          'ActivityLog',
          'TaxInvoice'
        ];

        if (ctx && modelsWithUser.includes(model)) {
          const anyArgs = args as any;
          
          if (['findMany', 'findFirst', 'count', 'updateMany', 'deleteMany'].includes(operation)) {
            // Safe to inject into where
            anyArgs.where = { ...anyArgs.where, userId: ctx.userId };
          } else if (['update', 'delete', 'findUnique'].includes(operation)) {
            // Cannot inject userId into where because Prisma requires unique fields.
            // We must verify ownership first using basePrisma.
            if (anyArgs.where && anyArgs.where.id) {
              const record = await (basePrisma as any)[model].findUnique({
                where: anyArgs.where,
                select: { userId: true }
              });
              
              if (record && record.userId && record.userId !== ctx.userId) {
                throw new Error('Akses ditolak: Data ini bukan milik Anda (RLS Violation).');
              }
            }
          } else if (['create', 'createMany'].includes(operation)) {
            if (anyArgs.data && !Array.isArray(anyArgs.data)) {
              anyArgs.data = { ...anyArgs.data, userId: ctx.userId };
            } else if (Array.isArray(anyArgs.data)) {
              anyArgs.data = anyArgs.data.map((item: any) => ({ ...item, userId: ctx.userId }));
            }
          }
        }
        return query(args);
      },
    },
  },
}) as unknown as PrismaClient; // Cast to PrismaClient to avoid complex type errors in repos

