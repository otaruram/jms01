import { prisma } from '../config/database';

export class ProjectRepository {
  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          totalCapital: true,
          client: {
            select: { id: true, name: true }
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      prisma.project.count(),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        totalCapital: true,
        clientId: true,
        client: {
          select: { id: true, name: true, contact: true }
        },
        capitals: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        installations: {
          select: {
            id: true,
            qty: true,
            createdAt: true,
            product: {
              select: { id: true, name: true, unit: true }
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  // Atomic transaction: create capital record + increment project total
  async addCapital(projectId: string, type: string, amount: number, description: string) {
    return await prisma.$transaction(async (tx) => {
      const capital = await tx.projectCapital.create({
        data: { projectId, type, amount, description }
      });

      await tx.project.update({
        where: { id: projectId },
        data: { totalCapital: { increment: amount } }
      });

      return capital;
    });
  }
}
