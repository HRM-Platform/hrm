import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './shift.entity';
import { Company } from 'src/companies/company.entity';
import { Department } from 'src/departments/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Company, Department])],

  providers: [ShiftsService],
  controllers: [ShiftsController],
})
export class ShiftsModule {}
