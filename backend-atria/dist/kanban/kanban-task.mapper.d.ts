import { KanbanTaskStatus, ProductionPhase } from '@prisma/client';
import { KanbanTaskStatusApi } from './kanban-status';
import { type ProductionPhaseApi } from './production-phase';
export interface UnifiedTaskClient {
    id: string;
    name: string;
    companyName: string;
    avatarUrl: string | null;
}
export interface UnifiedTaskCore {
    id: string;
    title: string;
    description: string | null;
    status: KanbanTaskStatusApi;
    productionPhase: ProductionPhaseApi | null;
    statusColor: string;
    statusLabel: string;
    dueDate: string | null;
    publicationDate: string | null;
    deliveryDate: string | null;
    clientId: string | null;
    companyId: string;
    client: UnifiedTaskClient | null;
    createdAt: string;
}
type TaskClientRecord = {
    id: string;
    companyName: string;
    avatarUrl: string | null;
};
export declare function toTaskClientResponse(client: TaskClientRecord | null | undefined): UnifiedTaskClient | null;
export declare function toUnifiedTaskCore(task: {
    id: string;
    title: string;
    description: string | null;
    status: KanbanTaskStatus;
    productionPhase?: ProductionPhase | null;
    dueDate: Date | null;
    publicationDate?: Date | null;
    deliveryDate?: Date | null;
    clientId: string | null;
    companyId: string;
    createdAt: Date;
    client?: TaskClientRecord | null;
}): UnifiedTaskCore;
export {};
