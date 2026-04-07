import { NotificationType } from '@prisma/client';
import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';

export const notificationsService = {
  async create(data: {
    recipientId: number;
    triggeredBy?: number;
    type: NotificationType;
    title: string;
    body: string;
    taskId?: number;
  }) {
    if (data.recipientId === data.triggeredBy) return; // don't notify yourself
    await prisma.notification.create({ data });
  },

  async list(userId: number, query: { page?: string; limit?: string }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: userId },
        include: { trigger: { select: { id: true, name: true, avatarUrl: true } } },
        skip, take, orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.notification.count({ where: { recipientId: userId } }),
    ]);
    return { notifications, total, page, limit };
  },

  async unreadCount(userId: number) {
    return prisma.notification.count({ where: { recipientId: userId, isRead: false } });
  },

  async markRead(id: number, userId: number) {
    await prisma.notification.updateMany({ where: { id, recipientId: userId }, data: { isRead: true } });
  },

  async markAllRead(userId: number) {
    await prisma.notification.updateMany({ where: { recipientId: userId, isRead: false }, data: { isRead: true } });
  },

  async delete(id: number, userId: number) {
    await prisma.notification.deleteMany({ where: { id, recipientId: userId } });
  },
};
