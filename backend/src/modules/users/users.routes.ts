import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import { avatarUpload } from '../../config/multer';
import {
  listUsers, getUserById, createUser, updateUser,
  deleteUser, uploadAvatar, getMyTasks, getMyTimeLogs
} from './users.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('Admin', 'Manager'), listUsers);
router.post('/', authorizeRoles('Admin'), createUser);
router.get('/me/tasks', getMyTasks);
router.get('/me/timelogs', getMyTimeLogs);
router.get('/:id', getUserById);
router.patch('/:id', authorizeRoles('Admin'), updateUser);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);
router.post('/:id/avatar', avatarUpload.single('avatar'), uploadAvatar);

export default router;
