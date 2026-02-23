import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BursaryNamesService } from './bursary-names.service';
import { BursaryNamesController } from './bursary-names.controller';
import { BursaryName } from './bursary-names.entity';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([BursaryName]), StorageModule],
  controllers: [BursaryNamesController],
  providers: [BursaryNamesService],
  exports: [BursaryNamesService],
})
export class BursaryNamesModule {}
