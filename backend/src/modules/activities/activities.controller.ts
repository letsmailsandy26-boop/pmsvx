import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendPaginated } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { getPagination } from '../../utils/pagination';
import prisma from '../../config/database';

export const listActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, take } = getPagination(req.query.page as string, req.query.limit as string);
  const where: Record<string, unknown> = {};
  if (req.query.userId) where.actorId = parseInt(req.query.userId as string);
  if (req.query.projectId) where.entityId = parseInt(req.query.projectId as string);
  const [activities, total] = await Promise.all([
    prisma.activity.findMany({ where, include: { actor: { select: { id: true, name: true, avatarUrl: true } } }, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.activity.count({ where }),
  ]);
  sendPaginated(res, activities, total, page, limit);
});
