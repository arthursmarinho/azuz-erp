import { Controller, Get, Param } from '@nestjs/common';
import { ProposalsService } from './proposals.service';

@Controller('public/proposals')
export class PublicProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get(':id')
  findPublic(@Param('id') id: string) {
    return this.proposalsService.findPublic(id);
  }
}
