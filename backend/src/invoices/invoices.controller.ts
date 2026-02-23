import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { Invoice } from './invoices.entity';
import { InvoiceDeliveryResult } from '../common/invoice/invoice-delivery.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: Invoice })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return await this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with pagination and search' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: Invoice[]; total: number }> {
    return await this.invoicesService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getInvoiceStats(): Promise<{
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    pendingAmount: number;
  }> {
    return await this.invoicesService.getInvoiceStats();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get invoices by status' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [Invoice] })
  async findByStatus(@Param('status') status: string): Promise<Invoice[]> {
    return await this.invoicesService.findByStatus(status);
  }

  @Get('paid')
  @ApiOperation({ summary: 'Get paid invoices' })
  @ApiResponse({ status: 200, description: 'Paid invoices retrieved successfully', type: [Invoice] })
  async findPaid(): Promise<Invoice[]> {
    return await this.invoicesService.findByStatus('paid');
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending invoices' })
  @ApiResponse({ status: 200, description: 'Pending invoices retrieved successfully', type: [Invoice] })
  async findPending(): Promise<Invoice[]> {
    return await this.invoicesService.findByStatus('pending');
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue invoices' })
  @ApiResponse({ status: 200, description: 'Overdue invoices retrieved successfully', type: [Invoice] })
  async findOverdue(): Promise<Invoice[]> {
    return await this.invoicesService.findByStatus('overdue');
  }

  @Get('student/:studentEmail')
  @ApiOperation({ summary: 'Get invoices by student email' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [Invoice] })
  async findByStudentEmail(@Param('studentEmail') studentEmail: string): Promise<Invoice[]> {
    return await this.invoicesService.findByStudentEmail(studentEmail);
  }

  @Get('bursary/:bursaryName')
  @ApiOperation({ summary: 'Get invoices by bursary name' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [Invoice] })
  async findByBursaryName(@Param('bursaryName') bursaryName: string): Promise<{ data: Invoice[]; total: number }> {
    const invoices = await this.invoicesService.findByBursaryName(bursaryName);
    return { data: invoices, total: invoices.length };
  }

  @Get('request/:requestUniqueId')
  @ApiOperation({ summary: 'Get invoices by linked tutor request ID' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [Invoice] })
  async findByRequestUniqueId(
    @Param('requestUniqueId') requestUniqueId: string,
  ): Promise<{ data: Invoice[]; total: number }> {
    const invoices = await this.invoicesService.findByRequestUniqueId(requestUniqueId);
    return { data: invoices, total: invoices.length };
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get invoice by unique ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully', type: Invoice })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<Invoice> {
    return await this.invoicesService.findOne(uniqueId);
  }

  @Patch(':uniqueId')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully', type: Invoice })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return await this.invoicesService.update(uniqueId, updateInvoiceDto);
  }

  @Patch(':uniqueId/mark-paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid successfully', type: Invoice })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async markAsPaid(
    @Param('uniqueId') uniqueId: string,
    @Body() body: { paymentMethod?: string },
  ): Promise<Invoice> {
    return await this.invoicesService.markAsPaid(uniqueId, body.paymentMethod);
  }

  @Post(':uniqueId/send')
  @ApiOperation({ summary: 'Generate invoice PDF and send via email' })
  @ApiResponse({ status: 200, description: 'Invoice delivery attempted successfully' })
  async sendInvoice(
    @Param('uniqueId') uniqueId: string,
    @Body() body: { recipientEmail?: string } = {},
  ): Promise<InvoiceDeliveryResult> {
    return await this.invoicesService.sendInvoiceEmail(uniqueId, body.recipientEmail);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async remove(@Param('uniqueId') uniqueId: string): Promise<{ message: string }> {
    await this.invoicesService.remove(uniqueId);
    return { message: 'Invoice deleted successfully' };
  }
}

