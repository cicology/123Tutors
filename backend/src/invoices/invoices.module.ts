import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice } from './invoices.entity';
import { InvoiceDeliveryService } from '../common/invoice/invoice-delivery.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceDeliveryService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

