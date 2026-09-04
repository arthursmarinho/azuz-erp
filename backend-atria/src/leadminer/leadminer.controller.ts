import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportLeadMinerLeadsDto } from './dto/import-leads.dto';
import type { SearchLeadsDTO } from './dto/search-leads.dto';
import { LeadminerService } from './leadminer.service';

@Controller('leadminer')
@UseGuards(JwtAuthGuard)
export class LeadMinerController {
  constructor(private readonly leadMinerService: LeadminerService) {}

  @Post('search')
  async searchLeads(@Body() dto: SearchLeadsDTO) {
    return await this.leadMinerService.SearchLeads(dto);
  }

  @Get('job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return await this.leadMinerService.getJobStatus(jobId);
  }

  @Post('import')
  async importLeads(@Body() dto: ImportLeadMinerLeadsDto) {
    return await this.leadMinerService.importLeads(dto);
  }
}
