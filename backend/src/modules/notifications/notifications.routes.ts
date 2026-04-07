import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { listNotifications, getUnreadCount, markRead, markAllRead, deleteNotification } from './notifications.controller';

const router = Router();
router.use(authenticateToken);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;
