import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { User } from 'src/users/user.entity';
import { CompaniesModule } from 'src/companies/companies.module';
import { DepartmentsModule } from 'src/departments/departments.module';
import { ShiftsModule } from 'src/shifts/shifts.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CompaniesModule,
    DepartmentsModule,
    ShiftsModule,
    AuthModule,
  ],
  controllers: [SetupController],
  providers: [SetupService],
  exports: [SetupService],
})
export class SetupModule {}
