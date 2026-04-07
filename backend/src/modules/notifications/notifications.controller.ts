import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { notificationsService } from './notifications.service';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await notificationsService.list(req.user!.id, req.query as Record<string, string>);
  sendPaginated(res, result.notifications, result.total, result.page, result.limit);
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationsService.unreadCount(req.user!.id);
  sendSuccess(res, { count });
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationsService.markRead(parseInt(req.params.id), req.user!.id);
  sendSuccess(res, null, 'Notification marked as read');
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationsService.markAllRead(req.user!.id);
  sendSuccess(res, null, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationsService.delete(parseInt(req.params.id), req.user!.id);
  sendSuccess(res, null, 'Notification deleted');
});
