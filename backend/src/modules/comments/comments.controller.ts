import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { commentsService } from './comments.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comments = await commentsService.list(parseInt(req.params.taskId));
  sendSuccess(res, comments);
});

export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { body } = req.body;
  if (!body) { sendError(res, 'Comment body required', 400); return; }
  const comment = await commentsService.create(parseInt(req.params.taskId), req.user!.id, body);
  sendSuccess(res, comment, 'Comment added', 201);
});

export const updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { body } = req.body;
  if (!body) { sendError(res, 'Comment body required', 400); return; }
  await commentsService.update(parseInt(req.params.commentId), req.user!.id, body);
  sendSuccess(res, null, 'Comment updated');
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  await commentsService.delete(parseInt(req.params.commentId), req.user!.id, req.user!.role);
  sendSuccess(res, null, 'Comment deleted');
});
