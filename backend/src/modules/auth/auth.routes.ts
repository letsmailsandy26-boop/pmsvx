import { Router } from 'express';
import { login, me, logout, changePassword } from './auth.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, me);
router.post('/logout', authenticateToken, logout);
router.patch('/change-password', authenticateToken, changePassword);

export default router;
