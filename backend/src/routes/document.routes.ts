import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { validate } from '../middlewares/validate';
import { createDocumentSchema } from '../validators/document.validator';
import { strictLimiter } from '../middlewares/rateLimiter';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const documentController = new DocumentController();

// GET riwayat dokumen
router.get('/', documentController.getAll);

// Single Input API dengan Rate Limiting Ketat (10 req/menit)
// Hanya SUPER_ADMIN dan ADMIN yang bisa submit dokumen
router.post(
  '/',
  strictLimiter,
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Dokumen'),
  validate(createDocumentSchema),
  documentController.createSmartDocument
);

export default router;
