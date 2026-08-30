import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { roleMiddleware } from '../middlewares/role';

const router = Router();
const reportsController = new ReportsController();

router.get('/profit-loss', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), reportsController.getProfitLoss);
router.get('/finance', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), reportsController.getFinance);
router.get('/projects', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), reportsController.getProjects);
router.get('/tax', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), reportsController.getTax);
router.get('/export', roleMiddleware(['SUPER_ADMIN', 'ADMIN']), reportsController.exportReport);

export default router;
