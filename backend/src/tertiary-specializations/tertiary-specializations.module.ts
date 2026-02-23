import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TertiarySpecializationsService } from './tertiary-specializations.service';
import { TertiarySpecializationsController } from './tertiary-specializations.controller';
import { TertiarySpecialization } from './tertiary-specializations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TertiarySpecialization])],
  controllers: [TertiarySpecializationsController],
  providers: [TertiarySpecializationsService],
  exports: [TertiarySpecializationsService],
})
export class TertiarySpecializationsModule {}