import { prisma } from '../config/database';

export class SphRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.sph.findMany({
        select: {
          id: true,
          clientId: true,
          projectId: true,
          subject: true,
          totalAmount: true,
          createdAt: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.sph.count(),
    ]);
    return { data, total };
  }

  async create(data: { clientId: string; projectId: string; subject: string; totalAmount: number; items: string }) {
    return await prisma.sph.create({
      data,
      select: { id: true, clientId: true, projectId: true, subject: true, totalAmount: true, createdAt: true, status: true },
    });
  }

  async delete(id: string) {
    return await prisma.sph.delete({ where: { id } });
  }
}

export class BastRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.bast.findMany({
        select: {
          id: true,
          clientId: true,
          projectId: true,
          description: true,
          createdAt: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.bast.count(),
    ]);
    return { data, total };
  }

  async create(data: { clientId: string; projectId: string; description: string }) {
    return await prisma.bast.create({
      data,
      select: { id: true, clientId: true, projectId: true, description: true, createdAt: true, status: true },
    });
  }

  async delete(id: string) {
    return await prisma.bast.delete({ where: { id } });
  }
}
