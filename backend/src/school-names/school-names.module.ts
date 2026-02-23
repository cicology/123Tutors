import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolNamesService } from './school-names.service';
import { SchoolNamesController } from './school-names.controller';
import { SchoolName } from './school-names.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolName])],
  controllers: [SchoolNamesController],
  providers: [SchoolNamesService],
  exports: [SchoolNamesService],
})
export class SchoolNamesModule {}
