import { LogCategory } from '@prisma/client';
import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { logActivity } from '../../utils/activityLogger';

export const timelogsService = {
  async listForTask(taskId: number) {
    return prisma.timeLog.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { logDate: 'desc' },
    });
  },

  async listAll(query: { page?: string; limit?: string; userId?: number; role?: string; projectId?: string; category?: string; filterUserId?: string; dateFrom?: string; dateTo?: string }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Record<string, unknown> = {};
    if (query.role === 'User') where.userId = query.userId;
    if (query.filterUserId) where.userId = parseInt(query.filterUserId);
    if (query.category) where.category = query.category as LogCategory;
    if (query.projectId) where.task = { projectId: parseInt(query.projectId) };
    if (query.dateFrom || query.dateTo) {
      where.logDate = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo + 'T23:59:59') } : {}),
      };
    }
    const [logs, total] = await Promise.all([
      prisma.timeLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, department: true } },
          task: { select: { id: true, title: true, project: { select: { id: true, name: true } } } },
        },
        skip, take, orderBy: { logDate: 'desc' },
      }),
      prisma.timeLog.count({ where }),
    ]);
    return { logs, total, page, limit };
  },

  async create(taskId: number, userId: number, data: { hours: number; category?: LogCategory; description?: string; logDate?: string }) {
    const timeLog = await prisma.$transaction(async (tx) => {
      const log = await tx.timeLog.create({
        data: { taskId, userId, hours: data.hours, category: data.category || LogCategory.Development, description: data.description, logDate: data.logDate ? new Date(data.logDate) : new Date() },
        include: { user: { select: { id: true, name: true } } },
      });
      await tx.task.update({ where: { id: taskId }, data: { timeSpentHours: { increment: data.hours } } });
      return log;
    });
    await logActivity({ entityType: 'Task', entityId: taskId, action: 'TimeLogged', actorId: userId, newValue: `${data.hours}h`, description: data.description });
    return timeLog;
  },

  async update(id: number, userId: number, data: { hours?: number; category?: LogCategory; description?: string }) {
    const existing = await prisma.timeLog.findFirst({ where: { id, userId } });
    if (!existing) throw Object.assign(new Error('Time log not found'), { statusCode: 404 });
    const diff = (data.hours || existing.hours) - existing.hours;
    const updated = await prisma.$transaction(async (tx) => {
      const log = await tx.timeLog.update({ where: { id }, data, include: { user: { select: { id: true, name: true } } } });
      await tx.task.update({ where: { id: existing.taskId }, data: { timeSpentHours: { increment: diff } } });
      return log;
    });
    return updated;
  },

  async delete(id: number, userId: number, role: string) {
    const where = role === 'Admin' ? { id } : { id, userId };
    const log = await prisma.timeLog.findFirst({ where });
    if (!log) throw Object.assign(new Error('Time log not found'), { statusCode: 404 });
    await prisma.$transaction([
      prisma.timeLog.delete({ where: { id } }),
      prisma.task.update({ where: { id: log.taskId }, data: { timeSpentHours: { decrement: log.hours } } }),
    ]);
  },
};
