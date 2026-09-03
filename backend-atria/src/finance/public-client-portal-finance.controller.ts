import { Controller, Get, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('api/public/client-portal')
export class PublicClientPortalFinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get(':clientId/finances')
  getClientFinances(@Param('clientId') clientId: string) {
    return this.financeService.getClientFinances(clientId);
  }
}
