import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnyPermissions } from '../auth/decorators/any-permissions.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getRequiredCrmPermissions } from '../auth/utils/rbac';
import { FetchMapsLeadsDto } from './dto/fetch-maps-leads.dto';
import { CreateLeadCommentDto } from './dto/lead-comment.dto';
import { AddLeadToKanbanDto, UpdateLeadStatusDto } from './dto/lead-kanban.dto';
import { ProspectingLeadsQueryDto } from '../crm/dto/prospecting-leads-query.dto';
import { LeadSearchDto } from './dto/lead-search.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@AnyPermissions(...getRequiredCrmPermissions())
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.leadsService.findAll(user);
  }

  @Get('kanban')
  getKanbanBoard(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ProspectingLeadsQueryDto,
  ) {
    return this.leadsService.findKanbanBoard(user, query.organizationId);
  }

  @Post('search')
  search(@Body() dto: LeadSearchDto) {
    return this.leadsService.search(dto);
  }

  @Post('fetch-maps')
  fetchMaps(@Body() dto: FetchMapsLeadsDto) {
    return this.leadsService.fetchMaps(dto);
  }

  @Post('kanban')
  addToKanban(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddLeadToKanbanDto,
  ) {
    return this.leadsService.addToKanban(user, dto);
  }

  @Delete(':id/kanban')
  removeFromKanban(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.leadsService.removeFromKanban(user, id);
  }

  @Get(':id/comments')
  getComments(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.leadsService.getComments(user, id);
  }

  @Post(':id/comments')
  createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateLeadCommentDto,
  ) {
    return this.leadsService.createComment(user, user.userId, id, dto.content);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateStatus(user, id, dto);
  }

  @Post(':id/qualify')
  qualify(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.leadsService.qualify(user, id);
  }
}
