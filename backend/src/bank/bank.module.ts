import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { Bank } from './bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bank])],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
