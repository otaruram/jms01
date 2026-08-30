import { Request, Response } from 'express';
import { ExpenseService } from '../services/expense.service';

const expenseService = new ExpenseService();

export class ExpenseController {
  getAllExpenses = async (req: Request, res: Response) => {
    try {
      const expenses = await expenseService.getAllExpenses();
      res.json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  createExpense = async (req: Request, res: Response) => {
    try {
      const { projectId, amount, date, description, category } = req.body;
      const expense = await expenseService.createExpense({
        projectId: projectId || undefined,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        description,
        category: category || undefined,
      });
      res.status(201).json({ success: true, data: expense });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteExpense = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await expenseService.deleteExpense(id);
      res.json({ success: true, message: 'Catatan pengeluaran berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
