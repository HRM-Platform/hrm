import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { User } from 'src/users/user.entity';
import { Shift } from 'src/shifts/shift.entity';
import { AttendanceHelper } from './helper/attendance.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User, Shift])],

  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceHelper],
  exports: [AttendanceService],
})
export class AttendanceModule {}
