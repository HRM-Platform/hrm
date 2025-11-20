import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { Company } from 'src/companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Company])],
  providers: [DepartmentsService],
  controllers: [DepartmentsController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
