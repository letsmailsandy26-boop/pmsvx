import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import {
  listProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectActivities
} from './projects.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/activities', getProjectActivities);

export default router;
