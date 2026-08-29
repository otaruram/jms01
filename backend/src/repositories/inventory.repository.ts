import { prisma } from '../config/database';

export class InventoryRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          stock: true,
          unit: true,
          status: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      prisma.product.count(),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
        unit: true,
        status: true,
      },
    });
  }

  // Uses Prisma Transaction to ensure data integrity (ACID)
  async createInstallationAndDeductStock(productId: string, projectId: string, qty: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Installation record
      const installation = await tx.installation.create({
        data: {
          productId,
          projectId,
          qty
        }
      });

      // 2. Deduct stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: { decrement: qty }
        }
      });

      // 3. Update status based on new stock level
      let newStatus = updatedProduct.status;
      if (updatedProduct.stock === 0) newStatus = 'Habis';
      else if (updatedProduct.stock <= 5) newStatus = 'Kritis';
      else newStatus = 'Aman';

      if (newStatus !== updatedProduct.status) {
        await tx.product.update({
          where: { id: productId },
          data: { status: newStatus }
        });
      }

      return installation;
    });
  }
}
