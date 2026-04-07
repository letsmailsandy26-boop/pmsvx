import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/auth';
import { userDashboard, managerDashboard, adminDashboard } from './dashboard.controller';

const router = Router();
router.use(authenticateToken);

router.get('/user', userDashboard);
router.get('/manager', authorizeRoles('Admin', 'Manager'), managerDashboard);
router.get('/admin', authorizeRoles('Admin'), adminDashboard);

export default router;
