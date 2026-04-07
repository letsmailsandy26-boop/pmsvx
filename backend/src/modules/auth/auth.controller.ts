import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) { sendError(res, 'Email and password required', 400); return; }
  const data = await authService.login(email, password);
  sendSuccess(res, data, 'Login successful');
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.me(req.user!.id);
  sendSuccess(res, user);
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  sendSuccess(res, null, 'Logged out successfully');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) { sendError(res, 'currentPassword and newPassword required', 400); return; }
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});
