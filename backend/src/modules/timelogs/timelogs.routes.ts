import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { listTaskTimeLogs, createTimeLog, updateTimeLog, deleteTimeLog } from './timelogs.controller';

const router = Router({ mergeParams: true });
router.use(authenticateToken);

router.get('/', listTaskTimeLogs);
router.post('/', createTimeLog);
router.patch('/:logId', updateTimeLog);
router.delete('/:logId', deleteTimeLog);

export default router;
