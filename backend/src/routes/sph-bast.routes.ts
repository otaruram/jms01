import { Router } from 'express';
import { SphController, BastController } from '../controllers/sph-bast.controller';
import { validate } from '../middlewares/validate';
import { createSphSchema, createBastSchema } from '../validators/sph-bast.validator';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const sphController = new SphController();
const bastController = new BastController();

// SPH endpoints
router.get('/sph', sphController.getAll);
router.post(
  '/sph',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('SPH'),
  validate(createSphSchema),
  sphController.create
);

// BAST endpoints
router.get('/bast', bastController.getAll);
router.post(
  '/bast',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('BAST'),
  validate(createBastSchema),
  bastController.create
);

export default router;
