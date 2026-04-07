import prisma from '../../config/database';

export const dashboardService = {
  async userDashboard(userId: number) {
    const [assignedTasks, pendingTasks, weeklyLogs, recentActivity] = await Promise.all([
      prisma.task.findMany({
        where: { assigneeId: userId, status: { not: 'Closed' } },
        include: { project: { select: { id: true, name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      prisma.task.count({ where: { assigneeId: userId, status: { in: ['New', 'InProgress'] } } }),
      prisma.timeLog.aggregate({
        where: { userId, logDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        _sum: { hours: true },
      }),
      prisma.activity.findMany({
        where: { actorId: userId },
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);
    return { assignedTasks, pendingTasksCount: pendingTasks, weeklyHours: weeklyLogs._sum.hours || 0, recentActivity };
  },

  async managerDashboard() {
    const [projects, taskSummary, topContributors] = await Promise.all([
      prisma.project.findMany({
        include: { _count: { select: { tasks: true } }, tasks: { select: { status: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.timeLog.groupBy({
        by: ['userId'],
        where: { logDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        _sum: { hours: true },
        orderBy: { _sum: { hours: 'desc' } },
        take: 10,
      }).then(async (rows) => {
        const userIds = rows.map(r => r.userId);
        const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, avatarUrl: true } });
        return rows.map(r => ({ ...r, user: users.find(u => u.id === r.userId) }));
      }),
    ]);
    const projectsWithProgress = projects.map(p => ({
      ...p,
      progress: p._count.tasks > 0 ? Math.round((p.tasks.filter(t => t.status === 'Closed').length / p._count.tasks) * 100) : 0,
    }));
    return { projects: projectsWithProgress, taskSummary, topContributors };
  },

  async adminDashboard() {
    const [userCount, projectCount, taskCount, recentActivity] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.task.count(),
      prisma.activity.findMany({
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);
    return { userCount, projectCount, taskCount, recentActivity };
  },
};
