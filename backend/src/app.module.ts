import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { BankModule } from './bank/bank.module';
import { BursaryNamesModule } from './bursary-names/bursary-names.module';
import { SchoolNamesModule } from './school-names/school-names.module';
import { TertiaryNamesModule } from './tertiary-names/tertiary-names.module';
import { TertiaryProgrammesModule } from './tertiary-programmes/tertiary-programmes.module';
import { TertiarySpecializationsModule } from './tertiary-specializations/tertiary-specializations.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { CoursesModule } from './courses/courses.module';
import { BursaryStudentsModule } from './bursary-students/bursary-students.module';
import { TutorRequestsModule } from './tutor-requests/tutor-requests.module';
import { TutorSessionsOrdersModule } from './tutor-sessions-orders/tutor-sessions-orders.module';
import { TutorJobNotificationsModule } from './tutor-job-notifications/tutor-job-notifications.module';
import { TutorStudentHoursModule } from './tutor-student-hours/tutor-student-hours.module';
import { StudentLessonsModule } from './student-lessons/student-lessons.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InvoicesModule } from './invoices/invoices.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import { LessonsModule } from './lessons/lessons.module';
import { BudgetModule } from './budget/budget.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        // Debug: Log the environment variables
        console.log('🔍 Environment Variables Debug:');
        console.log('DB_HOST:', configService.get('DB_HOST'));
        console.log('DB_PORT:', configService.get('DB_PORT'));
        console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
        console.log('DB_DATABASE:', configService.get('DB_DATABASE'));
        console.log('NODE_ENV:', configService.get('NODE_ENV'));
        
        // Parse DB_HOST to handle both JDBC URLs and plain hostnames
        const dbHost = configService.get('DB_HOST', 'localhost');
        let host = dbHost;
        
        // If DB_HOST contains a JDBC URL, extract the hostname
        if (dbHost.includes('jdbc:postgresql://')) {
          const urlMatch = dbHost.match(/jdbc:postgresql:\/\/([^:]+)/);
          if (urlMatch) {
            host = urlMatch[1];
            console.log('🔧 Extracted host from JDBC URL:', host);
          }
        }
        
        const config: TypeOrmModuleOptions = {
          type: 'postgres',
          host: host,
          port: parseInt(configService.get('DB_PORT', '5432'), 10),
          username: configService.get('DB_USERNAME', 'rootuser'),
          password: configService.get('DB_PASSWORD', 'root'),
          database: configService.get('DB_DATABASE', 'booksdb'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          retryAttempts: 3,
          retryDelay: 3000,
          // SSL configuration for production databases (like Render.com)
          // Always use SSL for external databases (Render.com, etc.)
          ssl:
            host.includes('render.com') ||
            host.includes('amazonaws.com') ||
            host.includes('heroku') ||
            host.includes('supabase.co')
              ? {
            rejectUnauthorized: false
          }
              : false,
        };
        
        console.log('🔧 Final DB Config:', {
          host: config.host,
          port: config.port,
          username: config.username,
          database: config.database,
          synchronize: config.synchronize,
          ssl: config.ssl
        });
        
        return config;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserProfilesModule,
    BankModule,
    BursaryNamesModule,
    SchoolNamesModule,
    TertiaryNamesModule,
    TertiaryProgrammesModule,
    TertiarySpecializationsModule,
    PromoCodesModule,
    CoursesModule,
    BursaryStudentsModule,
    TutorRequestsModule,
    TutorSessionsOrdersModule,
    TutorJobNotificationsModule,
    TutorStudentHoursModule,
    StudentLessonsModule,
    AnalyticsModule,
    InvoicesModule,
    StudentProgressModule,
    LessonsModule,
    BudgetModule,
    AuditModule,
    NotificationsModule,
    AdminModule,
    PaymentsModule,
  ],
})
export class AppModule {}
