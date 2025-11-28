import { Injectable } from '@nestjs/common';

import { User } from 'src/users/user.entity';
import { Shift } from 'src/shifts/shift.entity';
import { AttendanceHelper } from './helper/attendance.helper';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckOutDto } from './dtos/check-out.dto';
import { StartBreakDto } from './dtos/start-break.dto';
import { EndBreakDto } from './dtos/end-break.dto';

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

  // Mobile App Critical Methods
  async getCurrentStatus(userId: string) {
    const user = await this.helper.getUserWithDepartment(userId);
    const todayAttendance = await this.helper.getTodayAttendance(userId);
    const shift = await this.helper.getUserShift(user);

    const isCheckedIn = todayAttendance !== null;
    const isCheckedOut = todayAttendance?.check_out !== null;

    let workingHours = 0;
    if (todayAttendance && todayAttendance.check_in) {
      const endTime = todayAttendance.check_out || new Date();
      workingHours =
        (endTime.getTime() - new Date(todayAttendance.check_in).getTime()) /
        (1000 * 60 * 60);
    }

    return {
      isCheckedIn,
      isCheckedOut,
      workingHours: parseFloat(workingHours.toFixed(2)),
      todayAttendance,
      shift: {
        id: shift.id,
        name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        grace_period: shift.grace_period,
      },
    };
  }

  async getTodayAttendance(userId: string) {
    const attendance = await this.helper.getTodayAttendance(userId);
    if (!attendance) {
      return {
        message: 'No attendance record for today',
        data: null,
      };
    }

    let workingHours = 0;
    if (attendance.check_in) {
      const endTime = attendance.check_out || new Date();
      workingHours =
        (endTime.getTime() - new Date(attendance.check_in).getTime()) /
        (1000 * 60 * 60);
    }

    return {
      message: 'Today attendance retrieved successfully',
      data: {
        ...attendance,
        workingHours: parseFloat(workingHours.toFixed(2)),
      },
    };
  }

  async getAttendanceHistory(
    userId: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const result = await this.helper.getAttendanceHistory(
      userId,
      startDate,
      endDate,
      page,
      limit,
    );

    return {
      message: 'Attendance history retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getUserShiftInfo(userId: string) {
    const user = await this.helper.getUserWithDepartment(userId);
    const shift = await this.helper.getUserShift(user);

    const today = new Date().toISOString().split('T')[0];
    const shiftStart = new Date(`${today}T${shift.start_time}`);
    const shiftEnd = new Date(`${today}T${shift.end_time}`);
    const lateThreshold = new Date(
      shiftStart.getTime() + shift.grace_period * 60_000,
    );

    return {
      message: 'Shift information retrieved successfully',
      data: {
        shift: {
          id: shift.id,
          name: shift.name,
          start_time: shift.start_time,
          end_time: shift.end_time,
          grace_period: shift.grace_period,
        },
        timing: {
          shiftStart,
          shiftEnd,
          lateThreshold,
          canCheckInNow: new Date() >= shiftStart,
        },
      },
    };
  }

  // Break Management Methods
  async startBreak(dto: StartBreakDto) {
    return await this.helper.startBreak(dto.user_id);
  }

  async endBreak(dto: EndBreakDto) {
    return await this.helper.endBreak(dto.user_id);
  }

  async getBreaks(attendanceId: string) {
    return await this.helper.getBreaks(attendanceId);
  }

  async getActiveBreak(userId: string) {
    return await this.helper.getActiveBreak(userId);
  }

  // Mobile App Summary Methods
  async getDailySummary(userId: string, month: string, year: string) {
    return await this.helper.getDailySummary(userId, month, year);
  }

  async getWeeklySummary(userId: string, year: string) {
    return await this.helper.getWeeklySummary(userId, year);
  }
}
