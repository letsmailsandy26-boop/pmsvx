import { ActivityAction } from '@prisma/client';
import prisma from '../config/database';

interface LogActivityParams {
  entityType: 'Task' | 'Project';
  entityId: number;
  action: ActivityAction;
  actorId: number;
  oldValue?: string;
  newValue?: string;
  fieldName?: string;
  description?: string;
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    await prisma.activity.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorId: params.actorId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        fieldName: params.fieldName,
        description: params.description,
      },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};
