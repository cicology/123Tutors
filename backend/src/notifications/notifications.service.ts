import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { Invoice } from '../invoices/invoices.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';

export interface Notification {
  id: string;
  type: 'tutor_request' | 'hours_finished' | 'invoice_overdue';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  relatedId: string;
  relatedEntity: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(TutorRequest)
    private readonly tutorRequestRepository: Repository<TutorRequest>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(TutorSessionsOrder)
    private readonly tutorSessionsOrderRepository: Repository<TutorSessionsOrder>,
  ) {}

  async getNotifications(bursaryName: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // 1. Get pending tutor requests (student requests to be tutored)
    const pendingRequests = await this.tutorRequestRepository.find({
      where: {
        bursaryName,
        paid: false,
        notInterested: false,
        requestDelete: false,
      },
      order: {
        creationDate: 'DESC',
      },
    });

    pendingRequests.forEach((request) => {
      notifications.push({
        id: `tutor-request-${request.uniqueId}`,
        type: 'tutor_request',
        title: 'New Tutor Request',
        description: `${request.studentFirstName} ${request.studentLastName} (${request.studentEmail}) has requested tutoring`,
        timestamp: request.creationDate,
        priority: 'medium',
        relatedId: request.uniqueId,
        relatedEntity: 'tutor_request',
      });
    });

    // 2. Get overdue invoices
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await this.invoiceRepository.find({
      where: {
        bursaryName,
        status: 'pending',
        dueDate: LessThan(today),
      },
      order: {
        dueDate: 'ASC',
      },
    });

    overdueInvoices.forEach((invoice) => {
      const daysOverdue = Math.floor(
        (today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      notifications.push({
        id: `invoice-overdue-${invoice.uniqueId}`,
        type: 'invoice_overdue',
        title: 'Invoice Overdue',
        description: `Invoice ${invoice.invoiceNumber} for ${invoice.studentName} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue (Amount: R${invoice.amount.toFixed(2)})`,
        timestamp: invoice.dueDate,
        priority: daysOverdue > 7 ? 'high' : daysOverdue > 3 ? 'medium' : 'low',
        relatedId: invoice.uniqueId,
        relatedEntity: 'invoice',
      });
    });

    // 3. Get student hours that are finished
    // Check TutorSessionsOrder records where hoursRemaining is 0 or less
    const finishedHoursOrders = await this.tutorSessionsOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.request', 'request')
      .where('request.bursaryName = :bursaryName', { bursaryName })
      .andWhere('order.hoursRemaining IS NOT NULL')
      .andWhere('order.hoursRemaining <= :zero', { zero: 0 })
      .andWhere('request.paid = false')
      .andWhere('request.notInterested = false')
      .andWhere('request.requestDelete = false')
      .getMany();

    // Group by request to avoid duplicate notifications
    const processedRequests = new Set<string>();
    
    for (const order of finishedHoursOrders) {
      if (order.request && !processedRequests.has(order.request.uniqueId)) {
        processedRequests.add(order.request.uniqueId);
        const request = order.request;
        
        notifications.push({
          id: `hours-finished-${request.uniqueId}`,
          type: 'hours_finished',
          title: 'Student Hours Finished',
          description: `${request.studentFirstName} ${request.studentLastName} has used all allocated hours (${order.hours || 0} hours allocated, ${order.hoursRemaining || 0} remaining)`,
          timestamp: order.modifiedDate || order.creationDate,
          priority: 'medium',
          relatedId: request.uniqueId,
          relatedEntity: 'tutor_request',
        });
      }
    }

    // Sort by timestamp (most recent first)
    return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

