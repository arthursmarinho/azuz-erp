import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinancesApiController } from './finances-api.controller';
import { PublicClientPortalFinanceController } from './public-client-portal-finance.controller';

@Module({
  controllers: [
    FinanceController,
    FinancesApiController,
    PublicClientPortalFinanceController,
  ],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
