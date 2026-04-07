import prisma from '../../config/database';

interface DateFilter { from?: string; to?: string; }

const buildDateFilter = (filter: DateFilter) => {
  const result: Record<string, Date> = {};
  if (filter.from) result.gte = new Date(filter.from);
  if (filter.to) result.lte = new Date(filter.to);
  return Object.keys(result).length ? result : undefined;
};

export const reportsService = {
  async timeByUser(query: { projectId?: string; from?: string; to?: string }) {
    const dateFilter = buildDateFilter(query);
    const where: Record<string, unknown> = {};
    if (dateFilter) where.logDate = dateFilter;
    if (query.projectId) where.task = { projectId: parseInt(query.projectId) };
    return prisma.timeLog.groupBy({
      by: ['userId'],
      where,
      _sum: { hours: true },
      _count: { id: true },
      orderBy: { _sum: { hours: 'desc' } },
    }).then(async (rows) => {
      const userIds = rows.map(r => r.userId);
      const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
      return rows.map(r => ({ ...r, user: users.find(u => u.id === r.userId) }));
    });
  },

  async timeByProject(query: { from?: string; to?: string }) {
    const dateFilter = buildDateFilter(query);
    const where: Record<string, unknown> = {};
    if (dateFilter) where.logDate = dateFilter;
    const logs = await prisma.timeLog.findMany({ where, include: { task: { select: { project: { select: { id: true, name: true } } } } } });
    const byProject = new Map<number, { projectId: number; projectName: string; hours: number }>();
    for (const log of logs) {
      const pid = log.task.project.id;
      const entry = byProject.get(pid) || { projectId: pid, projectName: log.task.project.name, hours: 0 };
      entry.hours += log.hours;
      byProject.set(pid, entry);
    }
    return [...byProject.values()].sort((a, b) => b.hours - a.hours);
  },

  async timeByTask(query: { projectId?: string; userId?: string; from?: string; to?: string }) {
    const dateFilter = buildDateFilter(query);
    const where: Record<string, unknown> = {};
    if (dateFilter) where.logDate = dateFilter;
    if (query.userId) where.userId = parseInt(query.userId);
    if (query.projectId) where.task = { projectId: parseInt(query.projectId) };
    return prisma.timeLog.groupBy({ by: ['taskId'], where, _sum: { hours: true }, orderBy: { _sum: { hours: 'desc' } } })
      .then(async (rows) => {
        const taskIds = rows.map(r => r.taskId);
        const tasks = await prisma.task.findMany({ where: { id: { in: taskIds } }, select: { id: true, title: true, projectId: true } });
        return rows.map(r => ({ ...r, task: tasks.find(t => t.id === r.taskId) }));
      });
  },

  async taskStatusSummary(query: { projectId?: string }) {
    const where: Record<string, unknown> = {};
    if (query.projectId) where.projectId = parseInt(query.projectId);
    return prisma.task.groupBy({ by: ['status', 'projectId'], where, _count: { id: true }, orderBy: { projectId: 'asc' } })
      .then(async (rows) => {
        const projectIds = [...new Set(rows.map(r => r.projectId))];
        const projects = await prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true } });
        return rows.map(r => ({ ...r, project: projects.find(p => p.id === r.projectId) }));
      });
  },

  async projectProgress() {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true, timeSpentHours: true } },
      },
    });
    return projects.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      totalTasks: p._count.tasks,
      closedTasks: p.tasks.filter(t => t.status === 'Closed').length,
      progressPercent: p._count.tasks > 0 ? Math.round((p.tasks.filter(t => t.status === 'Closed').length / p._count.tasks) * 100) : 0,
      totalHours: p.tasks.reduce((sum, t) => sum + t.timeSpentHours, 0),
    }));
  },

  async myTimeSummary(userId: number, query: { from?: string; to?: string }) {
    const dateFilter = buildDateFilter(query);
    const where: Record<string, unknown> = { userId };
    if (dateFilter) where.logDate = dateFilter;
    return prisma.timeLog.groupBy({ by: ['category'], where, _sum: { hours: true }, _count: { id: true } });
  },
};
