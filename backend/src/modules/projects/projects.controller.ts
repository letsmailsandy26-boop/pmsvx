import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { projectsService } from './projects.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await projectsService.list({ ...req.query as Record<string, string>, userId: req.user!.id, role: req.user!.role });
  sendPaginated(res, result.projects, result.total, result.page, result.limit);
});

export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await projectsService.getById(parseInt(req.params.id));
  sendSuccess(res, project);
});

export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) { sendError(res, 'Project name required', 400); return; }
  const managerId = req.body.managerId || req.user!.id;
  const project = await projectsService.create({ ...req.body, managerId }, req.user!.id);
  sendSuccess(res, project, 'Project created', 201);
});

export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await projectsService.update(parseInt(req.params.id), req.body, req.user!.id);
  sendSuccess(res, project, 'Project updated');
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  await projectsService.delete(parseInt(req.params.id));
  sendSuccess(res, null, 'Project deleted');
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;
  if (!userId) { sendError(res, 'userId required', 400); return; }
  const member = await projectsService.addMember(parseInt(req.params.id), parseInt(userId), req.user!.id);
  sendSuccess(res, member, 'Member added', 201);
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  await projectsService.removeMember(parseInt(req.params.id), parseInt(req.params.userId), req.user!.id);
  sendSuccess(res, null, 'Member removed');
});

export const getProjectActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await projectsService.getActivities(parseInt(req.params.id), req.query as Record<string, string>);
  sendPaginated(res, result.activities, result.total, result.page, result.limit);
});
