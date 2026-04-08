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
router.delete('/:id', authorizeRoles('Admin', 'Manager'), deleteProject);
router.post('/:id/members', authorizeRoles('Admin', 'Manager'), addMember);
router.delete('/:id/members/:userId', authorizeRoles('Admin', 'Manager'), removeMember);
router.get('/:id/activities', getProjectActivities);

export default router;
