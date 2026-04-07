import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { listComments, createComment, updateComment, deleteComment } from './comments.controller';

const router = Router({ mergeParams: true });
router.use(authenticateToken);

router.get('/', listComments);
router.post('/', createComment);
router.patch('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;
