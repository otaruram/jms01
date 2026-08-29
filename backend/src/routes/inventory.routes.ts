import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { validate } from '../middlewares/validate';
import { installProductSchema } from '../validators/inventory.validator';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const inventoryController = new InventoryController();

// Read access is available for all authenticated users (SUPER_ADMIN, ADMIN, USER)
router.get('/', inventoryController.getInventory);

// Write access is only for SUPER_ADMIN and ADMIN
router.post(
  '/install',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Inventaris'),
  validate(installProductSchema),
  inventoryController.installProduct
);

export default router;
