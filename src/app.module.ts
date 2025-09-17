import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database/database.config';
import jwtConfig from './config/jwt/jwt.config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { JwtGlobalModule } from './jwt/jwt.module';
import { appProviders } from './common/providers/app.providers';
import { CompaniesModule } from './companies/companies.module';
import { DepartmentsModule } from './departments/departments.module';
import { ShiftsModule } from './shifts/shifts.module';
import { UserShiftsModule } from './user-shifts/user-shifts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
      load: [databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    JwtGlobalModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    DepartmentsModule,
    ShiftsModule,
    UserShiftsModule,
  ],
  controllers: [],
  providers: [...appProviders],
})
export class AppModule {}
