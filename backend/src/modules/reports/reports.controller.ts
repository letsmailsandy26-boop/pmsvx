import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const timeByUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportsService.timeByUser(req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const timeByProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportsService.timeByProject(req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const timeByTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportsService.timeByTask(req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const taskStatusSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportsService.taskStatusSummary(req.query as Record<string, string>);
  sendSuccess(res, data);
});

export const projectProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportsService.projectProgress();
  sendSuccess(res, data);
});

export const myTimeSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await reportsService.myTimeSummary(req.user!.id, req.query as Record<string, string>);
  sendSuccess(res, data);
});
