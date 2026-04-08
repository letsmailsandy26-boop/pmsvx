import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import { avatarUpload } from '../../config/multer';
import {
  listUsers, getUserById, createUser, updateUser,
  deleteUser, uploadAvatar, getMyTasks, getMyTimeLogs
} from './users.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', listUsers);
router.post('/', createUser);
router.get('/me/tasks', getMyTasks);
router.get('/me/timelogs', getMyTimeLogs);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/avatar', avatarUpload.single('avatar'), uploadAvatar);

export default router;
