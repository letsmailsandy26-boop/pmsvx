import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import {
  listTasks, getTask, createTask, updateTask, changeStatus,
  updateProgress, reassignTask, deleteTask, getTaskActivities
} from './tasks.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', listTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteTask);
router.patch('/:id/status', changeStatus);
router.patch('/:id/progress', updateProgress);
router.patch('/:id/assign', reassignTask);
router.get('/:id/activities', getTaskActivities);

export default router;
