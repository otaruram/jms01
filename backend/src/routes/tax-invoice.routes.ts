import { Router } from 'express';
import { TaxInvoiceController } from '../controllers/tax-invoice.controller';
import { validate } from '../middlewares/validate';
import { createTaxInvoiceSchema, updateTaxInvoiceSchema } from '../validators/tax-invoice.validator';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const taxInvoiceController = new TaxInvoiceController();

router.get('/', taxInvoiceController.getAll);

router.post(
  '/',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Faktur Pajak'),
  validate(createTaxInvoiceSchema),
  taxInvoiceController.create
);

router.patch(
  '/:id/status',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Faktur Pajak'),
  validate(updateTaxInvoiceSchema),
  taxInvoiceController.updateStatus
);

router.delete(
  '/:id',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Faktur Pajak'),
  taxInvoiceController.delete
);

export default router;
