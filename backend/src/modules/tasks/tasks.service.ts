import { TaskStatus, TaskType, Priority, ActivityAction, NotificationType } from '@prisma/client';
import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { logActivity } from '../../utils/activityLogger';
import { notificationsService } from '../notifications/notifications.service';

const taskInclude = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  reporter: { select: { id: true, name: true, avatarUrl: true } },
  reviewer: { select: { id: true, name: true, avatarUrl: true } },
};

export const tasksService = {
  async list(query: { page?: string; limit?: string; status?: string; type?: string; priority?: string; assigneeId?: string; projectId?: string; search?: string; userId?: number; role?: string }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status as TaskStatus;
    if (query.type) where.type = query.type as TaskType;
    if (query.priority) where.priority = query.priority as Priority;
    if (query.assigneeId) where.assigneeId = parseInt(query.assigneeId);
    if (query.projectId) where.projectId = parseInt(query.projectId);
    if (query.search) where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
    if (query.role === 'User') {
      where.project = { members: { some: { userId: query.userId } } };
    }
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, include: taskInclude, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.task.count({ where }),
    ]);
    return { tasks, total, page, limit };
  },

  async getById(id: number) {
    const [task, activities] = await Promise.all([
      prisma.task.findUnique({
        where: { id },
        include: {
          ...taskInclude,
          comments: { include: { author: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } },
          attachments: { include: { uploader: { select: { id: true, name: true } } } },
          timeLogs: { include: { user: { select: { id: true, name: true } } }, orderBy: { logDate: 'desc' } },
        },
      }),
      prisma.activity.findMany({
        where: { entityType: 'Task', entityId: id },
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);
    if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });
    return { ...task, activities };
  },

  async create(data: {
    projectId: number; title: string; description?: string; type?: TaskType; status?: TaskStatus;
    priority?: Priority; assigneeId?: number; reporterId: number; reviewerId?: number;
    estimatedHours?: number; startDate?: string; dueDate?: string; progressPercent?: number;
  }) {
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId, title: data.title, description: data.description,
        type: data.type || TaskType.Task, status: data.status || TaskStatus.New,
        priority: data.priority || Priority.Medium, assigneeId: data.assigneeId,
        reporterId: data.reporterId, reviewerId: data.reviewerId,
        estimatedHours: data.estimatedHours,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        progressPercent: data.progressPercent || 0,
      },
      include: taskInclude,
    });
    await logActivity({ entityType: 'Task', entityId: task.id, action: ActivityAction.TaskCreated, actorId: data.reporterId, description: `Task "${task.title}" created` });
    if (task.assigneeId && task.assigneeId !== data.reporterId) {
      await notificationsService.create({ recipientId: task.assigneeId, triggeredBy: data.reporterId, type: NotificationType.TaskAssigned, title: 'New task assigned', body: `You have been assigned to "${task.title}"`, taskId: task.id });
    }
    return task;
  },

  async update(id: number, data: Record<string, unknown>, actorId: number) {
    const allowed: Record<string, unknown> = {};
    const scalarFields = ['title', 'description', 'type', 'status', 'priority', 'assigneeId', 'reviewerId', 'estimatedHours', 'progressPercent', 'startDate', 'dueDate'];
    for (const field of scalarFields) {
      if (data[field] !== undefined) allowed[field] = data[field];
    }
    if (allowed.startDate) allowed.startDate = new Date(allowed.startDate as string);
    if (allowed.dueDate) allowed.dueDate = new Date(allowed.dueDate as string);
    if ('assigneeId' in allowed) allowed.assigneeId = allowed.assigneeId ? Number(allowed.assigneeId) : null;
    if ('reviewerId' in allowed) allowed.reviewerId = allowed.reviewerId ? Number(allowed.reviewerId) : null;
    if ('estimatedHours' in allowed) allowed.estimatedHours = allowed.estimatedHours !== '' && allowed.estimatedHours != null ? Number(allowed.estimatedHours) : null;
    const task = await prisma.task.update({ where: { id }, data: allowed, include: taskInclude });
    await logActivity({ entityType: 'Task', entityId: id, action: ActivityAction.TaskUpdated, actorId, description: 'Task updated' });
    return task;
  },

  async changeStatus(id: number, newStatus: TaskStatus, actorId: number) {
    const existing = await prisma.task.findUnique({ where: { id }, select: { status: true, assigneeId: true, reviewerId: true, title: true } });
    if (!existing) throw Object.assign(new Error('Task not found'), { statusCode: 404 });
    const closedAt = newStatus === TaskStatus.Closed ? new Date() : undefined;
    const task = await prisma.task.update({ where: { id }, data: { status: newStatus, ...(closedAt ? { closedAt } : {}) }, include: taskInclude });
    await logActivity({ entityType: 'Task', entityId: id, action: ActivityAction.StatusChanged, actorId, oldValue: existing.status, newValue: newStatus, fieldName: 'status' });
    const recipients = [existing.assigneeId, existing.reviewerId].filter((r): r is number => !!r && r !== actorId);
    for (const recipientId of recipients) {
      await notificationsService.create({ recipientId, triggeredBy: actorId, type: NotificationType.TaskStatusChanged, title: 'Task status changed', body: `"${existing.title}" moved to ${newStatus}`, taskId: id });
    }
    return task;
  },

  async updateProgress(id: number, progressPercent: number, actorId: number) {
    const task = await prisma.task.update({ where: { id }, data: { progressPercent }, include: taskInclude });
    await logActivity({ entityType: 'Task', entityId: id, action: ActivityAction.ProgressUpdated, actorId, newValue: `${progressPercent}%`, fieldName: 'progressPercent' });
    return task;
  },

  async reassign(id: number, data: { assigneeId?: number; reviewerId?: number }, actorId: number) {
    const task = await prisma.task.update({ where: { id }, data, include: taskInclude });
    if (data.assigneeId) {
      await logActivity({ entityType: 'Task', entityId: id, action: ActivityAction.AssigneeChanged, actorId, newValue: data.assigneeId.toString(), fieldName: 'assigneeId' });
      await notificationsService.create({ recipientId: data.assigneeId, triggeredBy: actorId, type: NotificationType.TaskAssigned, title: 'Task assigned to you', body: `You have been assigned to "${task.title}"`, taskId: id });
    }
    if (data.reviewerId) {
      await logActivity({ entityType: 'Task', entityId: id, action: ActivityAction.ReviewerChanged, actorId, newValue: data.reviewerId.toString(), fieldName: 'reviewerId' });
      await notificationsService.create({ recipientId: data.reviewerId, triggeredBy: actorId, type: NotificationType.ReviewRequested, title: 'Review requested', body: `You have been assigned as reviewer for "${task.title}"`, taskId: id });
    }
    return task;
  },

  async delete(id: number) {
    await prisma.task.delete({ where: { id } });
  },

  async getActivities(taskId: number, query: { page?: string; limit?: string }) {
    const { skip, take, page, limit } = getPagination(query.page, query.limit);
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { entityType: 'Task', entityId: taskId },
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
        skip, take, orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({ where: { entityType: 'Task', entityId: taskId } }),
    ]);
    return { activities, total, page, limit };
  },
};
