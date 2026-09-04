import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { QueryMetaAnalyticsDto } from './dto/query-meta-analytics.dto';
import { MetaAnalyticsService } from './meta-analytics.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MetaAnalyticsController {
  constructor(private readonly metaAnalyticsService: MetaAnalyticsService) {}

  @Get('api/integrations/meta/analytics')
  getAnalytics(@Query() query: QueryMetaAnalyticsDto) {
    return this.metaAnalyticsService.getAnalytics(
      {
        datePreset: query.datePreset ?? 'last_90d',
        month: query.month,
        year: query.year,
      },
      query.clientId,
      query.adAccountId,
    );
  }

  @Get('insights/clients')
  getAdAccounts(@Query() query: QueryMetaAnalyticsDto) {
    return this.metaAnalyticsService.getAdAccounts(query.search);
  }

  @Get('insights/agency')
  getAgencyOverview(@Query() query: QueryMetaAnalyticsDto) {
    return this.metaAnalyticsService.getAgencyOverview(
      {
        datePreset: query.datePreset ?? 'last_90d',
        month: query.month,
        year: query.year,
      },
      query.search,
    );
  }

  @Get('insights/client/:clientId')
  getClientInsights(
    @Param('clientId') clientId: string,
    @Query() query: QueryMetaAnalyticsDto,
  ) {
    const accountId =
      clientId?.trim() ||
      query.clientId?.trim() ||
      query.adAccountId?.trim() ||
      undefined;

    return this.metaAnalyticsService.getClientInsights(accountId, {
      datePreset: query.datePreset ?? 'last_90d',
      month: query.month,
      year: query.year,
    });
  }

  @Get('insights/client/:clientId/campaigns')
  getClientCampaigns(
    @Param('clientId') clientId: string,
    @Query() query: QueryMetaAnalyticsDto,
  ) {
    const accountId =
      clientId?.trim() ||
      query.clientId?.trim() ||
      query.adAccountId?.trim() ||
      undefined;

    return this.metaAnalyticsService.getCampaigns(accountId, {
      datePreset: query.datePreset ?? 'last_90d',
      month: query.month,
      year: query.year,
    });
  }
}
