import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfile } from './user-profiles.entity';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), StorageModule],
  controllers: [UserProfilesController],
  providers: [UserProfilesService],
  exports: [UserProfilesService],
})
export class UserProfilesModule {}
