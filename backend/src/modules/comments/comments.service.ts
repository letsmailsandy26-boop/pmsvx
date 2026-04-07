import { NotificationType } from '@prisma/client';
import prisma from '../../config/database';
import { logActivity } from '../../utils/activityLogger';
import { notificationsService } from '../notifications/notifications.service';

export const commentsService = {
  async list(taskId: number) {
    return prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  async create(taskId: number, authorId: number, body: string) {
    const comment = await prisma.comment.create({
      data: { taskId, authorId, body },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
    await logActivity({ entityType: 'Task', entityId: taskId, action: 'CommentAdded', actorId: authorId, description: body.substring(0, 100) });
    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { assigneeId: true, reporterId: true, reviewerId: true, title: true } });
    if (task) {
      const recipients = [...new Set([task.assigneeId, task.reporterId, task.reviewerId])].filter((r): r is number => !!r && r !== authorId);
      for (const recipientId of recipients) {
        await notificationsService.create({ recipientId, triggeredBy: authorId, type: NotificationType.CommentAdded, title: 'New comment', body: `Comment on "${task.title}"`, taskId });
      }
    }
    return comment;
  },

  async update(id: number, authorId: number, body: string) {
    return prisma.comment.updateMany({ where: { id, authorId }, data: { body, isEdited: true } });
  },

  async delete(id: number, userId: number, role: string) {
    const where = role === 'Admin' ? { id } : { id, authorId: userId };
    await prisma.comment.deleteMany({ where });
  },
};
