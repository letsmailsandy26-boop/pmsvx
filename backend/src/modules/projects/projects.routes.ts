import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import {
  listProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectActivities
} from './projects.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', listProjects);
router.post('/', authorizeRoles('Admin', 'Manager'), createProject);
router.get('/:id', getProject);
router.patch('/:id', authorizeRoles('Admin', 'Manager'), updateProject);
router.delete('/:id', authorizeRoles('Admin'), deleteProject);
router.post('/:id/members', authorizeRoles('Admin', 'Manager'), addMember);
router.delete('/:id/members/:userId', authorizeRoles('Admin', 'Manager'), removeMember);
router.get('/:id/activities', getProjectActivities);

export default router;
