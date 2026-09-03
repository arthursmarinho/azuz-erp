import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, unreadOnly?: boolean): Promise<{
        id: string;
        userId: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        taskId: string | null;
        createdAt: string;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
        taskId: string | null;
        createdAt: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    notifyTaskAssigned(assigneeIds: string[], taskTitle: string, actorId: string): Promise<void>;
    notifyContractSigned(userIds: string[], contractTitle: string, clientName: string): Promise<void>;
    notifyPostPending(userIds: string[], postTitle: string, clientName: string): Promise<void>;
    notifyPostRejected(userIds: string[], postTitle: string, clientName: string, reason: string): Promise<void>;
    notifyNewRequest(userIds: string[], requestTitle: string, clientName: string, options?: {
        companyId?: string;
    }): Promise<void>;
    notifyDueDateWarning(userIds: string[], taskTitle: string, overdue: boolean, options: {
        companyId: string;
        taskId: string;
    }): Promise<void>;
    notifyNewLeadInKanban(userIds: string[], leadName: string, options?: {
        companyId?: string;
    }): Promise<void>;
    createMany(userIds: string[], type: NotificationType, title: string, message: string, extra?: {
        companyId?: string;
        taskId?: string;
    }): Promise<void>;
    private toResponse;
}
