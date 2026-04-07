import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const userDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.userDashboard(req.user!.id);
  sendSuccess(res, data);
});

export const managerDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.managerDashboard();
  sendSuccess(res, data);
});

export const adminDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await dashboardService.adminDashboard();
  sendSuccess(res, data);
});
