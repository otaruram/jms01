import { prisma } from '../config/database';

export class OrderRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          client: {
            select: { id: true, name: true }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count(),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        total: true,
        status: true,
        createdAt: true,
        client: {
          select: { id: true, name: true, contact: true }
        },
      },
    });
  }

  async create(clientId: string, total: number) {
    return await prisma.order.create({
      data: { clientId, total },
      select: {
        id: true,
        clientId: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.order.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });
  }
}
