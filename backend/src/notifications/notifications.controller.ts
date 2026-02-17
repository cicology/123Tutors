import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationRecipientType } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('tutor')
  @UseGuards(JwtAuthGuard)
  async getTutorNotifications(@CurrentUser() user: any) {
    const tutorId = user.tutorId || user.id;
    return this.notificationsService.getTutorNotifications(tutorId);
  }

  @Get('student')
  @UseGuards(JwtAuthGuard)
  async getStudentNotifications(@CurrentUser() user: any) {
    const studentId = user.studentId || user.id;
    return this.notificationsService.getStudentNotifications(studentId);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: any) {
    const tutorId = user.tutorId;
    const studentId = user.studentId;
    return this.notificationsService.getUnreadCount(tutorId, studentId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    const tutorId = user.tutorId;
    const studentId = user.studentId;
    const recipientType = tutorId
      ? NotificationRecipientType.TUTOR
      : NotificationRecipientType.STUDENT;
    const userId = tutorId || studentId;
    return this.notificationsService.markAsRead(id, userId, recipientType);
  }
}


