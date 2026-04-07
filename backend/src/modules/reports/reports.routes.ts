import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import { timeByUser, timeByProject, timeByTask, taskStatusSummary, projectProgress, myTimeSummary } from './reports.controller';

const router = Router();
router.use(authenticateToken);

router.get('/time-by-user', authorizeRoles('Admin', 'Manager'), timeByUser);
router.get('/time-by-project', authorizeRoles('Admin', 'Manager'), timeByProject);
router.get('/time-by-task', authorizeRoles('Admin', 'Manager'), timeByTask);
router.get('/task-status-summary', authorizeRoles('Admin', 'Manager'), taskStatusSummary);
router.get('/project-progress', authorizeRoles('Admin', 'Manager'), projectProgress);
router.get('/my-time-summary', myTimeSummary);

export default router;
