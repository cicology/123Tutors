import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService, Notification } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for a bursary' })
  @ApiQuery({ name: 'bursaryName', required: true, description: 'Bursary name to filter notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(@Query('bursaryName') bursaryName: string): Promise<Notification[]> {
    return await this.notificationsService.getNotifications(bursaryName);
  }
}





