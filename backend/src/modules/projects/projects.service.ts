import { ProjectStatus, Priority } from '@prisma/client';
import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { logActivity } from '../../utils/activityLogger';

const projectInclude = {
  manager: { select: { id: true, name: true, avatarUrl: true } },
  members: { include: { user: { select: { id: true, name: true, avatarUrl: true, role: true } } } },
  _count: { select: { tasks: true } },
};

export const projectsService = {
  async list(query: { page?: string; limit?: string; status?: string; search?: string; userId?: number; role?: string }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status as ProjectStatus;
    if (query.search) where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
    if (query.role === 'User') {
      where.members = { some: { userId: query.userId } };
    }
    const [projects, total] = await Promise.all([
      prisma.project.findMany({ where, include: projectInclude, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.project.count({ where }),
    ]);
    return { projects, total, page, limit };
  },

  async getById(id: number) {
    const project = await prisma.project.findUnique({ where: { id }, include: projectInclude });
    if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    return project;
  },

  async create(data: { name: string; description?: string; clientName?: string; startDate?: string; endDate?: string; status?: ProjectStatus; priority?: Priority; managerId: number }, actorId: number) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        clientName: data.clientName,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status || ProjectStatus.Planning,
        priority: data.priority || Priority.Medium,
        managerId: data.managerId,
        members: { create: { userId: data.managerId } },
      },
      include: projectInclude,
    });
    await logActivity({ entityType: 'Project', entityId: project.id, action: 'ProjectCreated', actorId, description: `Project "${project.name}" created` });
    return project;
  },

  async update(id: number, data: Record<string, unknown>, actorId: number) {
    const allowed: Record<string, unknown> = {};
    const scalarFields = ['name', 'description', 'status', 'priority', 'managerId', 'startDate', 'endDate'];
    for (const field of scalarFields) {
      if (data[field] !== undefined) allowed[field] = data[field];
    }
    if (allowed.startDate) allowed.startDate = new Date(allowed.startDate as string);
    if (allowed.endDate) allowed.endDate = new Date(allowed.endDate as string);
    if (allowed.managerId) allowed.managerId = Number(allowed.managerId);
    const project = await prisma.project.update({ where: { id }, data: allowed, include: projectInclude });
    await logActivity({ entityType: 'Project', entityId: id, action: 'ProjectUpdated', actorId, description: `Project updated` });
    return project;
  },

  async delete(id: number) {
    await prisma.project.delete({ where: { id } });
  },

  async addMember(projectId: number, userId: number, actorId: number) {
    const member = await prisma.projectMember.create({
      data: { projectId, userId },
      include: { user: { select: { id: true, name: true } } },
    });
    await logActivity({ entityType: 'Project', entityId: projectId, action: 'MemberAdded', actorId, newValue: userId.toString(), description: `Member added` });
    return member;
  },

  async removeMember(projectId: number, userId: number, actorId: number) {
    await prisma.projectMember.deleteMany({ where: { projectId, userId } });
    await logActivity({ entityType: 'Project', entityId: projectId, action: 'MemberRemoved', actorId, oldValue: userId.toString(), description: `Member removed` });
  },

  async getActivities(projectId: number, query: { page?: string; limit?: string }) {
    const { skip, take, page, limit } = getPagination(query.page, query.limit);
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { entityType: 'Project', entityId: projectId },
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
        skip, take, orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({ where: { entityType: 'Project', entityId: projectId } }),
    ]);
    return { activities, total, page, limit };
  },
};
