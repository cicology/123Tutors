import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TertiaryNamesService } from './tertiary-names.service';
import { TertiaryNamesController } from './tertiary-names.controller';
import { TertiaryName } from './tertiary-names.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TertiaryName])],
  controllers: [TertiaryNamesController],
  providers: [TertiaryNamesService],
  exports: [TertiaryNamesService],
})
export class TertiaryNamesModule {}
