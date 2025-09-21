import { Injectable } from '@nestjs/common';

import { User } from 'src/users/user.entity';
import { Shift } from 'src/shifts/shift.entity';
import { AttendanceHelper } from './helper/attendance.helper';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckOutDto } from './dtos/check-out.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly helper: AttendanceHelper) {}

  async checkIn(dto: CheckInDto) {
    const user: User = await this.helper.getUserWithDepartment(dto.user_id);
    this.helper.validateUserDepartment(user);

    await this.helper.checkExistingAttendance(dto.user_id);

    const shift: Shift = await this.helper.getUserShift(user);
    this.helper.validateShiftTiming(shift);

    const status = this.helper.calculateAttendanceStatus(shift);
    const attendance = await this.helper.createAttendanceRecord(
      user,
      shift,
      status,
    );

    return {
      message: 'Check-in successful',
      data: attendance,
    };
  }

  async checkOut(checkOutDto: CheckOutDto) {
    return this.helper.checkOut(checkOutDto.user_id);
  }

  async getUserAttendance(userId: string) {
    return this.helper.getUserAttendance(userId);
  }

  async getDepartmentAttendance(departmentId: string, date: string) {
    return this.helper.getDepartmentAttendance(departmentId, date);
  }

  async getCompanyAttendance(companyId: string, date: string) {
    return this.helper.getCompanyAttendance(companyId, date);
  }
}
