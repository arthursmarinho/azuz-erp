import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryFinanceDto } from './dto/query-finance.dto';
import { FinanceService } from './finance.service';

@Controller('api/finances')
@UseGuards(JwtAuthGuard)
export class FinancesApiController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('due-today-alerts')
  getDueTodayAlerts(@CurrentUser() user: AuthenticatedUser) {
    return this.financeService.getDueTodayAlerts(user.userId);
  }

  @Get('monthly-cashflow')
  getMonthlyCashflow(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryFinanceDto,
  ) {
    return this.financeService.getMonthlyCashflow(user.userId, query);
  }
}
