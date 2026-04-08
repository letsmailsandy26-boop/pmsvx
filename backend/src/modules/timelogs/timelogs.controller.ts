import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { timelogsService } from './timelogs.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listTaskTimeLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const logs = await timelogsService.listForTask(parseInt(req.params.taskId));
  sendSuccess(res, logs);
});

export const listAllTimeLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await timelogsService.listAll({ ...(req.query as Record<string, string>), userId: req.user!.id, role: req.user!.role });
  sendPaginated(res, result.logs, result.total, result.page, result.limit);
});

export const createTimeLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { hours } = req.body;
  if (!hours || hours <= 0) { sendError(res, 'Valid hours required', 400); return; }
  const log = await timelogsService.create(parseInt(req.params.taskId), req.user!.id, req.body);
  sendSuccess(res, log, 'Time logged', 201);
});

export const updateTimeLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await timelogsService.update(parseInt(req.params.logId), req.user!.id, req.body);
  sendSuccess(res, updated, 'Time log updated');
});

export const deleteTimeLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  await timelogsService.delete(parseInt(req.params.logId), req.user!.id, req.user!.role);
  sendSuccess(res, null, 'Time log deleted');
});
