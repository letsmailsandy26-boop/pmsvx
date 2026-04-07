import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';

const userSelect = {
  id: true, name: true, email: true, role: true,
  department: true, designation: true, phone: true,
  avatarUrl: true, isActive: true, createdAt: true, updatedAt: true,
};

export const usersService = {
  async list(query: { page?: string; limit?: string; role?: string; search?: string; isActive?: string }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Record<string, unknown> = {};
    if (query.role) where.role = query.role as Role;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query.search) where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit };
  },

  async getById(id: number) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  },

  async create(data: { name: string; email: string; password: string; role?: Role; department?: string; designation?: string; phone?: string }) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role || Role.User, department: data.department, designation: data.designation, phone: data.phone },
      select: userSelect,
    });
    return user;
  },

  async update(id: number, data: { name?: string; email?: string; password?: string; role?: Role; department?: string; designation?: string; phone?: string; isActive?: boolean }) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password && data.password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    const user = await prisma.user.update({ where: { id }, data: updateData, select: userSelect });
    return user;
  },

  async delete(id: number) {
    // Nullify FK references before deleting
    await prisma.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } });
    await prisma.task.updateMany({ where: { reviewerId: id }, data: { reviewerId: null } });
    await prisma.project.updateMany({ where: { managerId: id }, data: { managerId: 1 } });
    await prisma.user.delete({ where: { id } });
  },

  async updateAvatar(id: number, avatarUrl: string) {
    return prisma.user.update({ where: { id }, data: { avatarUrl }, select: userSelect });
  },

  async getMyTasks(userId: number) {
    return prisma.task.findMany({
      where: { assigneeId: userId, status: { not: 'Closed' } },
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  },

  async getMyTimeLogs(userId: number, query: { page?: string; limit?: string }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const [logs, total] = await Promise.all([
      prisma.timeLog.findMany({
        where: { userId },
        include: { task: { select: { id: true, title: true } } },
        skip, take, orderBy: { logDate: 'desc' },
      }),
      prisma.timeLog.count({ where: { userId } }),
    ]);
    return { logs, total, page, limit };
  },
};
