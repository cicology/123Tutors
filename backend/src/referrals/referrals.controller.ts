import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('generate')
  generate(@CurrentUser() tutor: any) {
    return this.referralsService.generateCode(tutor.id);
  }

  @Get()
  findAll(@CurrentUser() tutor: any) {
    return this.referralsService.findAll(tutor.id);
  }

  @Get('stats')
  getStats(@CurrentUser() tutor: any) {
    return this.referralsService.getReferralStats(tutor.id);
  }

  @Get(':id')
  findOne(@CurrentUser() tutor: any, @Param('id') id: string) {
    return this.referralsService.findOne(id, tutor.id);
  }
}

