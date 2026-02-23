import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorSessionsOrdersService } from './tutor-sessions-orders.service';
import { TutorSessionsOrdersController } from './tutor-sessions-orders.controller';
import { TutorSessionsOrder } from './tutor-sessions-orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TutorSessionsOrder])],
  controllers: [TutorSessionsOrdersController],
  providers: [TutorSessionsOrdersService],
  exports: [TutorSessionsOrdersService],
})
export class TutorSessionsOrdersModule {}