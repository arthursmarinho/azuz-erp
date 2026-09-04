"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, unreadOnly = false) {
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
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    async markAsRead(userId, id) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const updated = await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        return this.toResponse(updated);
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    }
    async notifyTaskAssigned(assigneeIds, taskTitle, actorId) {
        const recipients = assigneeIds.filter((id) => id !== actorId);
        await this.createMany(recipients, client_1.NotificationType.TASK_ASSIGNED, 'Nova tarefa atribuída', `Você foi atribuído à tarefa "${taskTitle}"`);
    }
    async notifyContractSigned(userIds, contractTitle, clientName) {
        await this.createMany(userIds, client_1.NotificationType.CONTRACT_SIGNED, 'Contrato assinado', `O contrato "${contractTitle}" de ${clientName} foi assinado`);
    }
    async notifyPostPending(userIds, postTitle, clientName) {
        await this.createMany(userIds, client_1.NotificationType.POST_PENDING, 'Post aguardando aprovação', `"${postTitle}" de ${clientName} está pendente de aprovação`);
    }
    async notifyPostRejected(userIds, postTitle, clientName, reason) {
        await this.createMany(userIds, client_1.NotificationType.POST_REJECTED, 'Post rejeitado', `"${postTitle}" de ${clientName} foi rejeitado: ${reason.slice(0, 200)}`);
    }
    async notifyNewRequest(userIds, requestTitle, clientName, options) {
        await this.createMany(userIds, client_1.NotificationType.NEW_REQUEST, 'Nova solicitação', `${clientName} enviou a solicitação "${requestTitle}"`, options);
    }
    async notifyDueDateWarning(userIds, taskTitle, overdue, options) {
        const title = overdue ? 'Tarefa atrasada' : 'Prazo de entrega';
        const message = overdue
            ? `A tarefa "${taskTitle}" está atrasada.`
            : `A tarefa "${taskTitle}" vence em menos de 24 horas.`;
        await this.createMany(userIds, client_1.NotificationType.DUE_DATE_WARNING, title, message, options);
    }
    async notifyNewLeadInKanban(userIds, leadName, options) {
        await this.createMany(userIds, client_1.NotificationType.SYSTEM, 'Novo Lead no Kanban', `${leadName} foi adicionado ao seu funil.`, options);
    }
    async notifyAppUpdate(userIds, updateTitle, options) {
        await this.createMany(userIds, client_1.NotificationType.APP_UPDATE, 'Nova atualização do app', `Confira: "${updateTitle}"`, options);
    }
    async getAppUpdateUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                type: client_1.NotificationType.APP_UPDATE,
                isRead: false,
            },
        });
    }
    async markAppUpdateNotificationAsRead(userId, appUpdateId) {
        await this.prisma.notification.updateMany({
            where: {
                userId,
                type: client_1.NotificationType.APP_UPDATE,
                appUpdateId,
                isRead: false,
            },
            data: { isRead: true },
        });
        return { success: true };
    }
    async markAppUpdateNotificationsAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: {
                userId,
                type: client_1.NotificationType.APP_UPDATE,
                isRead: false,
            },
            data: { isRead: true },
        });
        return { success: true };
    }
    async createMany(userIds, type, title, message, extra) {
        const uniqueIds = [...new Set(userIds)].filter(Boolean);
        if (uniqueIds.length === 0)
            return;
        await this.prisma.notification.createMany({
            data: uniqueIds.map((userId) => ({
                userId,
                type,
                title,
                message,
                ...(extra?.companyId ? { companyId: extra.companyId } : {}),
                ...(extra?.taskId ? { taskId: extra.taskId } : {}),
                ...(extra?.appUpdateId ? { appUpdateId: extra.appUpdateId } : {}),
            })),
        });
    }
    toResponse(notification) {
        return {
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: String(notification.type).toLowerCase(),
            isRead: notification.isRead,
            taskId: notification.taskId ?? null,
            appUpdateId: notification.appUpdateId ?? null,
            createdAt: notification.createdAt.toISOString(),
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map