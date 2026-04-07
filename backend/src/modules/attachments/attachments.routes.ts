import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { taskUpload, projectUpload } from '../../config/multer';
import { listTaskAttachments, listProjectAttachments, uploadAttachment, downloadAttachment, deleteAttachment } from './attachments.controller';

const taskRouter = Router({ mergeParams: true });
taskRouter.use(authenticateToken);
taskRouter.get('/', listTaskAttachments);
taskRouter.post('/', taskUpload.single('file'), uploadAttachment);

const projectRouter = Router({ mergeParams: true });
projectRouter.use(authenticateToken);
projectRouter.get('/', listProjectAttachments);
projectRouter.post('/', projectUpload.single('file'), uploadAttachment);

const mainRouter = Router();
mainRouter.use(authenticateToken);
mainRouter.get('/:id/download', downloadAttachment);
mainRouter.delete('/:id', deleteAttachment);

export { taskRouter, projectRouter, mainRouter as attachmentsMainRouter };
