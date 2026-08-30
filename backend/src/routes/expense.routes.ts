import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const expenseController = new ExpenseController();

router.get('/', expenseController.getAllExpenses);

router.post(
  '/',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Pengeluaran'),
  expenseController.createExpense
);

router.delete(
  '/:id',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Pengeluaran'),
  expenseController.deleteExpense
);

export default router;
