import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validate } from '../middlewares/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const orderController = new OrderController();

router.get('/', orderController.getAllOrders);

router.post(
  '/',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Pesanan'),
  validate(createOrderSchema),
  orderController.createOrder
);

router.patch(
  '/:id/status',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Pesanan'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

export default router;
