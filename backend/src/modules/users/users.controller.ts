import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { usersService } from './users.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import path from 'path';

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await usersService.list(req.query as Record<string, string>);
  sendPaginated(res, result.users, result.total, result.page, result.limit);
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await usersService.getById(parseInt(req.params.id));
  sendSuccess(res, user);
});

export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, department, designation, phone } = req.body;
  if (!name || !email || !password) { sendError(res, 'name, email, and password required', 400); return; }
  const user = await usersService.create({ name, email, password, role, department, designation, phone });
  sendSuccess(res, user, 'User created', 201);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await usersService.update(parseInt(req.params.id), req.body);
  sendSuccess(res, user, 'User updated');
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await usersService.delete(parseInt(req.params.id));
  sendSuccess(res, null, 'User deleted');
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  if (req.user!.role !== 'Admin' && req.user!.id !== userId) { sendError(res, 'Forbidden', 403); return; }
  if (!req.file) { sendError(res, 'No file uploaded', 400); return; }
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await usersService.updateAvatar(userId, avatarUrl);
  sendSuccess(res, user, 'Avatar updated');
});

export const getMyTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tasks = await usersService.getMyTasks(req.user!.id);
  sendSuccess(res, tasks);
});

export const getMyTimeLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await usersService.getMyTimeLogs(req.user!.id, req.query as Record<string, string>);
  sendPaginated(res, result.logs, result.total, result.page, result.limit);
});
