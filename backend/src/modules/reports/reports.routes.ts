import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import { timeByUser, timeByProject, timeByTask, taskStatusSummary, projectProgress, myTimeSummary } from './reports.controller';

const router = Router();
router.use(authenticateToken);

router.get('/time-by-user', timeByUser);
router.get('/time-by-project', timeByProject);
router.get('/time-by-task', timeByTask);
router.get('/task-status-summary', taskStatusSummary);
router.get('/project-progress', projectProgress);
router.get('/my-time-summary', myTimeSummary);

export default router;
