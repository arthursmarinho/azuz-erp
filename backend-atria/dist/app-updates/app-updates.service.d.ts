import { PrismaService } from '../prisma/prisma.service';
import { CreateAppUpdateDto, UpdateAppUpdateDto } from './dto/app-update.dto';
export declare class AppUpdatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAccess(role: string, companyId: string | null): Promise<{
        canView: boolean;
        canManage: boolean;
    }>;
    findAll(role: string, companyId: string | null): Promise<{
        id: string;
        title: string;
        body: string;
        visibleRoles: string[];
        isPublished: boolean;
        createdById: string;
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        companyId: string;
        createdAt: string;
        updatedAt: string;
    }[]>;
    create(userId: string, companyId: string | null, dto: CreateAppUpdateDto): Promise<{
        id: string;
        title: string;
        body: string;
        visibleRoles: string[];
        isPublished: boolean;
        createdById: string;
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        companyId: string;
        createdAt: string;
        updatedAt: string;
    }>;
    update(id: string, companyId: string | null, dto: UpdateAppUpdateDto): Promise<{
        id: string;
        title: string;
        body: string;
        visibleRoles: string[];
        isPublished: boolean;
        createdById: string;
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        companyId: string;
        createdAt: string;
        updatedAt: string;
    }>;
    remove(id: string, companyId: string | null): Promise<{
        success: boolean;
    }>;
    private viewerWhere;
    private findOwnedUpdate;
    private normalizeVisibleRoles;
    private toResponse;
}
