import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationRecipientType } from './entities/notification.entity';
import { RequestStatus } from '../requests/entities/course-request.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: {
    type: NotificationType;
    recipientType: NotificationRecipientType;
    tutorId?: string;
    studentId?: string;
    title: string;
    message: string;
    requestId?: string;
  }) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async getTutorNotifications(tutorId: string) {
    const allNotifications = await this.notificationRepository.find({
      where: { tutorId, recipientType: NotificationRecipientType.TUTOR },
      relations: ['request', 'request.student', 'request.course'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    // Filter out request_received notifications for non-pending requests
    return allNotifications.filter(notification => {
      if (notification.type === NotificationType.REQUEST_RECEIVED) {
        // If request relation is loaded, check status
        if (notification.request) {
          // Only show notifications for pending requests
          // Filter out accepted, declined, and referred requests
          // TypeORM stores enum values as strings, so compare with string 'pending'
          const requestStatus = String(notification.request.status).toLowerCase();
          return requestStatus === 'pending';
        }
        // If request relation is not loaded but requestId exists, include it
        // This handles edge cases where the relation might not load properly
        // The frontend will handle displaying it
        if (notification.requestId) {
          return true;
        }
        // If no requestId, exclude it
        return false;
      }
      return true;
    });
  }

  async getStudentNotifications(studentId: string) {
    return this.notificationRepository.find({
      where: { studentId, recipientType: NotificationRecipientType.STUDENT },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string, recipientType: NotificationRecipientType) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        ...(recipientType === NotificationRecipientType.TUTOR
          ? { tutorId: userId }
          : { studentId: userId }),
      },
    });

    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      return this.notificationRepository.save(notification);
    }

    return null;
  }

  async getUnreadCount(tutorId?: string, studentId?: string) {
    if (tutorId) {
      return this.notificationRepository.count({
        where: {
          tutorId,
          recipientType: NotificationRecipientType.TUTOR,
          isRead: false,
        },
      });
    }

    if (studentId) {
      return this.notificationRepository.count({
        where: {
          studentId,
          recipientType: NotificationRecipientType.STUDENT,
          isRead: false,
        },
      });
    }

    return 0;
  }

  async markRequestNotificationsAsRead(requestId: string, notificationType: NotificationType) {
    const notifications = await this.notificationRepository.find({
      where: {
        requestId,
        type: notificationType,
        isRead: false,
      },
    });

    if (notifications.length > 0) {
      notifications.forEach(notification => {
        notification.isRead = true;
        notification.readAt = new Date();
      });
      return this.notificationRepository.save(notifications);
    }

    return [];
  }
}


