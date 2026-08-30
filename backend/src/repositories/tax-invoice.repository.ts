import { prisma } from '../config/database';

export class TaxInvoiceRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.taxInvoice.findMany({
        include: {
          client: { select: { name: true } },
          project: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.taxInvoice.count(),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return await prisma.taxInvoice.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, contact: true } },
        project: { select: { name: true } },
      },
    });
  }

  async create(data: any) {
    return await prisma.taxInvoice.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return await prisma.taxInvoice.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.taxInvoice.delete({
      where: { id },
    });
  }
}
