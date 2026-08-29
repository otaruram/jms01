import { Router } from 'express';
import { systemController } from '../controllers/system.controller';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

// Semua endpoint di sini hanya bisa diakses oleh SUPER_ADMIN
router.use(roleMiddleware(['SUPER_ADMIN']));

// User Management
router.get('/users', systemController.getUsers);
router.patch('/users/:id/role', activityLogger('Sistem (Manajemen Pengguna)'), systemController.updateUserRole);

// Activity Logs
router.get('/logs', systemController.getLogs);

export default router;
