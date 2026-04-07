import prisma from '../../config/database';
import { logActivity } from '../../utils/activityLogger';
import path from 'path';
import fs from 'fs';

export const attachmentsService = {
  async create(data: { filename: string; originalName: string; mimeType: string; sizeBytes: number; storagePath: string; uploaderId: number; taskId?: number; projectId?: number }) {
    const attachment = await prisma.attachment.create({
      data,
      include: { uploader: { select: { id: true, name: true } } },
    });
    if (data.taskId) {
      await logActivity({ entityType: 'Task', entityId: data.taskId, action: 'AttachmentAdded', actorId: data.uploaderId, newValue: data.originalName });
    }
    return attachment;
  },

  async listForTask(taskId: number) {
    return prisma.attachment.findMany({
      where: { taskId },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async listForProject(projectId: number) {
    return prisma.attachment.findMany({
      where: { projectId },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: number) {
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw Object.assign(new Error('Attachment not found'), { statusCode: 404 });
    return attachment;
  },

  async delete(id: number, userId: number, role: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw Object.assign(new Error('Attachment not found'), { statusCode: 404 });
    if (role !== 'Admin' && attachment.uploaderId !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    const fullPath = path.join(process.cwd(), attachment.storagePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await prisma.attachment.delete({ where: { id } });
  },
};
