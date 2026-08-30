import { ExpenseRepository } from '../repositories/expense.repository';

const expenseRepository = new ExpenseRepository();

export class ExpenseService {
  async getAllExpenses() {
    return await expenseRepository.getAll();
  }

  async createExpense(data: { projectId?: string; amount: number; date: Date; description: string; category?: string }) {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Jumlah pengeluaran harus lebih dari 0.');
    }
    if (!data.description) {
      throw new Error('Deskripsi pengeluaran wajib diisi.');
    }
    return await expenseRepository.create(data);
  }

  async deleteExpense(id: string) {
    return await expenseRepository.delete(id);
  }
}
