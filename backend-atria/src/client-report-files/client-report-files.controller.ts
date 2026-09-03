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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientReportFilesService } from './client-report-files.service';
import {
  ApproveClientReportFileDto,
  CreateClientReportFileDto,
  QueryClientReportFilesDto,
  UpdateClientReportFileDto,
} from './dto/client-report-file.dto';

@Controller('client-report-files')
@UseGuards(JwtAuthGuard)
export class ClientReportFilesController {
  constructor(
    private readonly clientReportFilesService: ClientReportFilesService,
  ) {}

  @Get()
  findAll(@Query() query: QueryClientReportFilesDto) {
    return this.clientReportFilesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientReportFilesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientReportFileDto) {
    return this.clientReportFilesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientReportFileDto) {
    return this.clientReportFilesService.update(id, dto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveClientReportFileDto) {
    return this.clientReportFilesService.approve(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientReportFilesService.remove(id);
  }
}
