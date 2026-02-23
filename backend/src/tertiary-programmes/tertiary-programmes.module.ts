import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TertiaryProgrammesService } from './tertiary-programmes.service';
import { TertiaryProgrammesController } from './tertiary-programmes.controller';
import { TertiaryProgramme } from './tertiary-programmes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TertiaryProgramme])],
  controllers: [TertiaryProgrammesController],
  providers: [TertiaryProgrammesService],
  exports: [TertiaryProgrammesService],
})
export class TertiaryProgrammesModule {}
