import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { Referral } from './entities/referral.entity';
import { Tutor } from '../tutors/entities/tutor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, Tutor])],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}

