import { prisma } from '../config/database';

export class ExpenseRepository {
  async create(data: { projectId?: string; amount: number; date: Date; description: string; category?: string }) {
    return await prisma.expense.create({
      data: {
        projectId: data.projectId,
        amount: data.amount,
        date: data.date,
        description: data.description,
        category: data.category,
      },
    });
  }

  async getAll() {
    return await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    return await prisma.expense.delete({ where: { id } });
  }
}
