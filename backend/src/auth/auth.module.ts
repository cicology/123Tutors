import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { BursaryAdminGuard } from './bursary-admin.guard';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';

@Module({
  imports: [
    UserProfilesModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        if (!jwtSecret && isProduction) {
          throw new Error('JWT_SECRET must be set in production');
        }

        return {
          secret: jwtSecret || 'local-dev-secret-change-me',
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, SupabaseAuthGuard, BursaryAdminGuard],
  exports: [AuthService, JwtAuthGuard, SupabaseAuthGuard, BursaryAdminGuard],
})
export class AuthModule {}
