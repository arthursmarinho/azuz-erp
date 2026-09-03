import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateClientBriefSlaDto, UpdateSlaSettingsDto } from './dto/sla.dto';
import { SlaService } from './sla.service';

@Controller('sla')
@UseGuards(JwtAuthGuard)
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get('settings')
  getSettings() {
    return this.slaService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateSlaSettingsDto) {
    return this.slaService.updateSettings(dto);
  }

  @Get('dashboard')
  getDashboard() {
    return this.slaService.getDashboard();
  }

  @Patch('briefs/:id')
  updateBrief(@Param('id') id: string, @Body() dto: UpdateClientBriefSlaDto) {
    return this.slaService.updateBrief(id, dto);
  }
}
