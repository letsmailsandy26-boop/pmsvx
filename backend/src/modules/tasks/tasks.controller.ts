import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { tasksService } from './tasks.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { TaskStatus } from '@prisma/client';

export const listTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await tasksService.list({ ...req.query as Record<string, string>, userId: req.user!.id, role: req.user!.role });
  sendPaginated(res, result.tasks, result.total, result.page, result.limit);
});

export const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await tasksService.getById(parseInt(req.params.id));
  sendSuccess(res, task);
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, projectId } = req.body;
  if (!title || !projectId) { sendError(res, 'title and projectId required', 400); return; }
  const task = await tasksService.create({ ...req.body, reporterId: req.user!.id, projectId: parseInt(projectId) });
  sendSuccess(res, task, 'Task created', 201);
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await tasksService.update(parseInt(req.params.id), req.body, req.user!.id);
  sendSuccess(res, task, 'Task updated');
});

export const changeStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!status) { sendError(res, 'status required', 400); return; }
  const task = await tasksService.changeStatus(parseInt(req.params.id), status as TaskStatus, req.user!.id);
  sendSuccess(res, task, 'Status updated');
});

export const updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { progressPercent } = req.body;
  if (progressPercent === undefined) { sendError(res, 'progressPercent required', 400); return; }
  const task = await tasksService.updateProgress(parseInt(req.params.id), parseInt(progressPercent), req.user!.id);
  sendSuccess(res, task, 'Progress updated');
});

export const reassignTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await tasksService.reassign(parseInt(req.params.id), req.body, req.user!.id);
  sendSuccess(res, task, 'Task reassigned');
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  await tasksService.delete(parseInt(req.params.id));
  sendSuccess(res, null, 'Task deleted');
});

export const getTaskActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await tasksService.getActivities(parseInt(req.params.id), req.query as Record<string, string>);
  sendPaginated(res, result.activities, result.total, result.page, result.limit);
});
