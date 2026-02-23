import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCode } from './promo-codes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode])],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}