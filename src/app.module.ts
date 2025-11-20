import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt/jwt.config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { appProviders } from './common/providers/app.providers';
import { CompaniesModule } from './companies/companies.module';
import { DepartmentsModule } from './departments/departments.module';
import { ShiftsModule } from './shifts/shifts.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeavetypeModule } from './leave/leavetype/leavetype.module';
import { LeaveBalanceModule } from './leave/leave-balance/leave-balance.module';
import { LeaveRequestModule } from './leave/leave-request/leave-request.module';
import { ExistsConstraint } from './common/validators/exists.constraint';
import { SetupModule } from './setup/setup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
      load: [databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    DepartmentsModule,
    ShiftsModule,
    AttendanceModule,
    LeavetypeModule,
    LeaveBalanceModule,
    LeaveRequestModule,
    SetupModule,
  ],
  controllers: [],
  providers: [...appProviders],
  exports: [ExistsConstraint],
})
export class AppModule {}
