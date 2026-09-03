import { Module } from '@nestjs/common';
import { DueDateAlertsService } from './due-date-alerts.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, DueDateAlertsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
