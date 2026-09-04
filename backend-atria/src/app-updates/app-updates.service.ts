import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { normalizeRoleName } from '../auth/constants/permissions';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppUpdateDto, UpdateAppUpdateDto } from './dto/app-update.dto';

const DEFAULT_COMPANY_ID = '00000000-0000-4000-8000-000000000001';

const SELECTABLE_ROLES: RoleName[] = [
  RoleName.MASTER,
  RoleName.ADMIN,
  RoleName.MANAGER,
  RoleName.USER,
  RoleName.CONTENT_CREATOR,
  RoleName.DESIGNER_MASTER,
  RoleName.DESIGNER_JUNIOR,
  RoleName.CRM,
];

@Injectable()
export class AppUpdatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(role: string, companyId: string | null) {
    const roleName = normalizeRoleName(role);
    const canManage = roleName === RoleName.MASTER;

    if (canManage) {
      return { canView: true, canManage: true };
    }

    if (!roleName) {
      return { canView: false, canManage: false };
    }

    const count = await this.prisma.appUpdate.count({
      where: this.viewerWhere(roleName, companyId),
    });

    return { canView: count > 0, canManage: false };
  }

  async findAll(role: string, companyId: string | null) {
    const roleName = normalizeRoleName(role);
    if (!roleName) {
      throw new ForbiddenException('Invalid role');
    }

    const isMaster = roleName === RoleName.MASTER;
    const items = await this.prisma.appUpdate.findMany({
      where: isMaster
        ? companyId
          ? { companyId }
          : {}
        : this.viewerWhere(roleName, companyId),
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => this.toResponse(item));
  }

  async create(
    userId: string,
    companyId: string | null,
    dto: CreateAppUpdateDto,
  ) {
    const visibleRoles = this.normalizeVisibleRoles(dto.visibleRoles);
    const item = await this.prisma.appUpdate.create({
      data: {
        title: dto.title.trim(),
        body: dto.body.trim(),
        visibleRoles,
        isPublished: dto.isPublished ?? true,
        createdById: userId,
        companyId: companyId ?? DEFAULT_COMPANY_ID,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.toResponse(item);
  }

  async update(
    id: string,
    companyId: string | null,
    dto: UpdateAppUpdateDto,
  ) {
    const existing = await this.findOwnedUpdate(id, companyId);

    const updated = await this.prisma.appUpdate.update({
      where: { id: existing.id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.body !== undefined ? { body: dto.body.trim() } : {}),
        ...(dto.visibleRoles !== undefined
          ? { visibleRoles: this.normalizeVisibleRoles(dto.visibleRoles) }
          : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.toResponse(updated);
  }

  async remove(id: string, companyId: string | null) {
    const existing = await this.findOwnedUpdate(id, companyId);
    await this.prisma.appUpdate.delete({ where: { id: existing.id } });
    return { success: true };
  }

  private viewerWhere(roleName: RoleName, companyId: string | null) {
    return {
      isPublished: true,
      visibleRoles: { has: roleName },
      ...(companyId ? { companyId } : {}),
    };
  }

  private async findOwnedUpdate(id: string, companyId: string | null) {
    const item = await this.prisma.appUpdate.findFirst({
      where: {
        id,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (!item) {
      throw new NotFoundException('App update not found');
    }

    return item;
  }

  private normalizeVisibleRoles(roles: RoleName[]): RoleName[] {
    const normalized = roles
      .map((role) => normalizeRoleName(String(role)))
      .filter((role): role is RoleName => role !== null)
      .filter((role) => SELECTABLE_ROLES.includes(role));

    if (normalized.length === 0) {
      throw new ForbiddenException('At least one valid role must be selected');
    }

    return Array.from(new Set(normalized));
  }

  private toResponse(item: {
    id: string;
    title: string;
    body: string;
    visibleRoles: RoleName[];
    isPublished: boolean;
    createdById: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: { id: string; name: string; email: string };
  }) {
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      visibleRoles: item.visibleRoles.map((role) => role.toLowerCase()),
      isPublished: item.isPublished,
      createdById: item.createdById,
      createdBy: item.createdBy,
      companyId: item.companyId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
