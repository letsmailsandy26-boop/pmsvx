import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { attachmentsService } from './attachments.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import path from 'path';

export const listTaskAttachments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attachments = await attachmentsService.listForTask(parseInt(req.params.taskId));
  sendSuccess(res, attachments);
});

export const listProjectAttachments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attachments = await attachmentsService.listForProject(parseInt(req.params.projectId));
  sendSuccess(res, attachments);
});

export const uploadAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) { sendError(res, 'No file uploaded', 400); return; }
  const taskId = req.params.taskId ? parseInt(req.params.taskId) : undefined;
  const projectId = req.params.projectId ? parseInt(req.params.projectId) : undefined;
  const subfolder = taskId ? 'tasks' : 'projects';
  const attachment = await attachmentsService.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    storagePath: `uploads/${subfolder}/${req.file.filename}`,
    uploaderId: req.user!.id,
    taskId,
    projectId,
  });
  sendSuccess(res, attachment, 'File uploaded', 201);
});

export const downloadAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attachment = await attachmentsService.getById(parseInt(req.params.id));
  const filePath = path.join(process.cwd(), attachment.storagePath);
  res.download(filePath, attachment.originalName);
});

export const deleteAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  await attachmentsService.delete(parseInt(req.params.id), req.user!.id, req.user!.role);
  sendSuccess(res, null, 'Attachment deleted');
});
