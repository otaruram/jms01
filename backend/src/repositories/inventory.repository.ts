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

  async getInstallations(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.installation.findMany({
        include: {
          product: { select: { name: true, unit: true } },
          project: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.installation.count(),
    ]);
    return { data, total };
  }

  async create(data: { name: string; category: string; stock: number; unit: string; status?: string }) {
    let status = data.status;
    if (!status) {
      if (data.stock === 0) status = 'Habis';
      else if (data.stock <= 5) status = 'Kritis';
      else status = 'Aman';
    }
    return await prisma.product.create({
      data: { ...data, status: status as string },
    });
  }

  async addStock(id: string, qty: number) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: { stock: { increment: qty } }
      });
      
      let newStatus = updated.status;
      if (updated.stock === 0) newStatus = 'Habis';
      else if (updated.stock <= 5) newStatus = 'Kritis';
      else newStatus = 'Aman';

      if (newStatus !== updated.status) {
        return await tx.product.update({
          where: { id },
          data: { status: newStatus }
        });
      }
      return updated;
    });
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

  async delete(id: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.installation.deleteMany({ where: { productId: id } });
      return await tx.product.delete({ where: { id } });
    });
  }

  async deleteInstallation(id: string) {
    return await prisma.$transaction(async (tx) => {
      const installation = await tx.installation.findUnique({
        where: { id },
      });

      if (!installation) {
        throw new Error('Data instalasi tidak ditemukan');
      }

      // Restore product stock
      await tx.product.update({
        where: { id: installation.productId },
        data: { stock: { increment: installation.qty } },
      });

      // Delete the installation record
      return await tx.installation.delete({
        where: { id },
      });
    });
  }
}
