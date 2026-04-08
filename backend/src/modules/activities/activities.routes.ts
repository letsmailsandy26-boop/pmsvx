import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import { listActivities } from './activities.controller';

const router = Router();
router.use(authenticateToken);
router.get('/', listActivities);

export default router;
