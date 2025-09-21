import { Module } from '@nestjs/common';
import { LeavetypeController } from './leavetype.controller';
import { LeavetypeService } from './leavetype.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveType } from './leave-type.entity';
import { Company } from 'src/companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveType, Company])],
  controllers: [LeavetypeController],
  providers: [LeavetypeService],
})
export class LeavetypeModule {}
