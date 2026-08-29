import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validate } from '../middlewares/validate';
import { addCapitalSchema, createProjectSchema } from '../validators/project.validator';
import { roleMiddleware } from '../middlewares/role';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();
const projectController = new ProjectController();

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectDetails);

router.post(
  '/capital',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Proyek'),
  validate(addCapitalSchema),
  projectController.addCapital
);

router.post(
  '/',
  roleMiddleware(['SUPER_ADMIN', 'ADMIN']),
  activityLogger('Proyek'),
  validate(createProjectSchema),
  projectController.createProject
);

export default router;
