import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StorageService,
      useFactory: (configService: ConfigService) => {
        return new StorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}

