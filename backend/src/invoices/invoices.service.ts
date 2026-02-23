import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoices.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { InvoiceDeliveryResult, InvoiceDeliveryService } from '../common/invoice/invoice-delivery.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly invoiceDeliveryService: InvoiceDeliveryService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { autoSendEmail, ...invoicePayload } = createInvoiceDto;
    const now = new Date();
    const issueDate = createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : now;
    const dueDate = createInvoiceDto.dueDate
      ? new Date(createInvoiceDto.dueDate)
      : new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const uniqueId = createInvoiceDto.uniqueId || `INV_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const invoice = this.invoiceRepository.create({
      ...invoicePayload,
      uniqueId,
      issueDate,
      dueDate,
      status: createInvoiceDto.status || 'pending',
      paymentMethod: createInvoiceDto.paymentMethod || 'pending',
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    if (autoSendEmail || process.env.INVOICE_AUTO_SEND === 'true') {
      try {
        await this.sendInvoiceEmail(savedInvoice.uniqueId);
      } catch (error) {
        this.logger.warn(
          `Invoice ${savedInvoice.uniqueId} was created but email send failed: ${error?.message}`,
        );
      }
    }

    return savedInvoice;
  }

  async findAll(
    paginationDto: PaginationDto,
    searchDto: SearchDto,
  ): Promise<{ data: Invoice[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { search = '' } = searchDto;

    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

    if (search) {
      queryBuilder.where(
        'invoice.invoiceNumber ILIKE :search OR invoice.studentName ILIKE :search OR invoice.studentEmail ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('invoice.creationDate', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { uniqueId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${uniqueId} not found`);
    }

    return invoice;
  }

  async findByStudentEmail(studentEmail: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { studentEmail },
      order: { creationDate: 'DESC' },
    });
  }

  async findByBursaryName(bursaryName: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { bursaryName },
      order: { creationDate: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { status: status as any },
      order: { creationDate: 'DESC' },
    });
  }

  async findByRequestUniqueId(requestUniqueId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { requestUniqueId },
      order: { creationDate: 'DESC' },
    });
  }

  async findLatestByRequestUniqueId(requestUniqueId: string): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({
      where: { requestUniqueId },
      order: { creationDate: 'DESC' },
    });
  }

  async update(uniqueId: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(uniqueId);
    
    Object.assign(invoice, updateInvoiceDto);
    return await this.invoiceRepository.save(invoice);
  }

  async markAsPaid(uniqueId: string, paymentMethod?: string): Promise<Invoice> {
    const invoice = await this.findOne(uniqueId);
    
    invoice.status = 'paid';
    invoice.paymentDate = new Date();
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async getInvoiceStats(): Promise<{
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    pendingAmount: number;
  }> {
    const totalInvoices = await this.invoiceRepository.count();
    const paidInvoices = await this.invoiceRepository.count({ where: { status: 'paid' } });
    const pendingInvoices = await this.invoiceRepository.count({ where: { status: 'pending' } });
    const overdueInvoices = await this.invoiceRepository.count({ where: { status: 'overdue' } });

    const paidInvoicesData = await this.invoiceRepository.find({ where: { status: 'paid' } });
    const pendingInvoicesData = await this.invoiceRepository.find({ 
      where: { status: 'pending' } 
    });
    const overdueInvoicesData = await this.invoiceRepository.find({ 
      where: { status: 'overdue' } 
    });

    const totalRevenue = paidInvoicesData.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const pendingAmount = [...pendingInvoicesData, ...overdueInvoicesData]
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingAmount,
    };
  }

  async remove(uniqueId: string): Promise<void> {
    const invoice = await this.findOne(uniqueId);
    await this.invoiceRepository.remove(invoice);
  }

  async sendInvoiceEmail(
    uniqueId: string,
    recipientOverride?: string,
  ): Promise<InvoiceDeliveryResult> {
    const invoice = await this.findOne(uniqueId);
    return await this.invoiceDeliveryService.sendInvoice(invoice, recipientOverride);
  }
}

