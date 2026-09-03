import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, unreadOnly = false) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((notification) => this.toResponse(notification));
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return this.toResponse(updated);
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async notifyTaskAssigned(
    assigneeIds: string[],
    taskTitle: string,
    actorId: string,
  ) {
    const recipients = assigneeIds.filter((id) => id !== actorId);
    await this.createMany(
      recipients,
      NotificationType.TASK_ASSIGNED,
      'Nova tarefa atribuída',
      `Você foi atribuído à tarefa "${taskTitle}"`,
    );
  }

  async notifyContractSigned(
    userIds: string[],
    contractTitle: string,
    clientName: string,
  ) {
    await this.createMany(
      userIds,
      NotificationType.CONTRACT_SIGNED,
      'Contrato assinado',
      `O contrato "${contractTitle}" de ${clientName} foi assinado`,
    );
  }

  async notifyPostPending(
    userIds: string[],
    postTitle: string,
    clientName: string,
  ) {
    await this.createMany(
      userIds,
      NotificationType.POST_PENDING,
      'Post aguardando aprovação',
      `"${postTitle}" de ${clientName} está pendente de aprovação`,
    );
  }

  async notifyPostRejected(
    userIds: string[],
    postTitle: string,
    clientName: string,
    reason: string,
  ) {
    await this.createMany(
      userIds,
      NotificationType.POST_REJECTED,
      'Post rejeitado',
      `"${postTitle}" de ${clientName} foi rejeitado: ${reason.slice(0, 200)}`,
    );
  }

  async notifyNewRequest(
    userIds: string[],
    requestTitle: string,
    clientName: string,
    options?: { companyId?: string },
  ) {
    await this.createMany(
      userIds,
      NotificationType.NEW_REQUEST,
      'Nova solicitação',
      `${clientName} enviou a solicitação "${requestTitle}"`,
      options,
    );
  }

  async notifyDueDateWarning(
    userIds: string[],
    taskTitle: string,
    overdue: boolean,
    options: { companyId: string; taskId: string },
  ) {
    const title = overdue ? 'Tarefa atrasada' : 'Prazo de entrega';
    const message = overdue
      ? `A tarefa "${taskTitle}" está atrasada.`
      : `A tarefa "${taskTitle}" vence em menos de 24 horas.`;

    await this.createMany(
      userIds,
      NotificationType.DUE_DATE_WARNING,
      title,
      message,
      options,
    );
  }

  async notifyNewLeadInKanban(
    userIds: string[],
    leadName: string,
    options?: { companyId?: string },
  ) {
    await this.createMany(
      userIds,
      NotificationType.SYSTEM,
      'Novo Lead no Kanban',
      `${leadName} foi adicionado ao seu funil.`,
      options,
    );
  }

  async createMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    extra?: { companyId?: string; taskId?: string },
  ) {
    const uniqueIds = [...new Set(userIds)].filter(Boolean);
    if (uniqueIds.length === 0) return;

    await this.prisma.notification.createMany({
      data: uniqueIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        ...(extra?.companyId ? { companyId: extra.companyId } : {}),
        ...(extra?.taskId ? { taskId: extra.taskId } : {}),
      })),
    });
  }

  private toResponse(notification: {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType | string;
    isRead: boolean;
    createdAt: Date;
    taskId?: string | null;
  }) {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: String(notification.type).toLowerCase(),
      isRead: notification.isRead,
      taskId: notification.taskId ?? null,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
