// src/attendance/helpers/attendance.helper.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { IsNull, Like, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Shift } from 'src/shifts/shift.entity';
import { Attendance } from '../attendance.entity';
import { Break } from '../break.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AttendanceHelper {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,

    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Break)
    private readonly breakRepo: Repository<Break>,
  ) {}

  async getUserWithDepartment(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['department', 'department.company'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  validateUserDepartment(user: User) {
    if (!user.department) {
      throw new BadRequestException('User is not assigned to any department');
    }
  }

  async checkExistingAttendance(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: today },
    });
    if (existing) {
      throw new BadRequestException('Attendance already exists');
    }
  }

  async getUserShift(user: User) {
    // First, try to find a department-specific shift
    let shift = await this.shiftRepo.findOne({
      where: { department: { id: user.department!.id } },
    });

    // If no department-specific shift, fallback to company-wide shift
    if (!shift) {
      shift = await this.shiftRepo.findOne({
        where: {
          company: { id: user.department!.company.id },
          department: IsNull(),
        },
      });
    }

    if (!shift) throw new BadRequestException('No shift assigned for user');
    return shift;
  }

  validateShiftTiming(shift: Shift) {
    if (shift.start_time >= shift.end_time) {
      throw new BadRequestException('Shift start time must be before end time');
    }
  }

  calculateAttendanceStatus(shift: Shift): 'PRESENT' | 'LATE' {
    const today = new Date().toISOString().split('T')[0];
    const shiftStart = new Date(`${today}T${shift.start_time}`);
    const lateThreshold = new Date(
      shiftStart.getTime() + shift.grace_period * 60_000,
    );
    return new Date() > lateThreshold ? 'LATE' : 'PRESENT';
  }

  async createAttendanceRecord(
    user: User,
    shift: Shift,
    status: 'PRESENT' | 'LATE',
  ) {
    const attendance = this.attendanceRepo.create({
      user,
      shift,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date(),
      status,
    });
    return this.attendanceRepo.save(attendance);
  }

  async checkOut(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: today },
      relations: ['shift'],
    });

    if (!attendance)
      throw new BadRequestException('User has not checked in today');
    if (attendance.check_out)
      throw new BadRequestException('User already checked out today');

    attendance.check_out = new Date();
    return this.attendanceRepo.save(attendance);
  }

  async getUserAttendance(userId: string) {
    return this.attendanceRepo.find({
      where: { user: { id: userId } },
      relations: ['shift'],
      order: { date: 'DESC' },
    });
  }

  async getDepartmentAttendance(departmentId: string, date: string) {
    return this.attendanceRepo.find({
      where: { user: { department: { id: departmentId } }, date },
      relations: ['user', 'shift'],
    });
  }

  async getCompanyAttendance(companyId: string, date: string) {
    return this.attendanceRepo.find({
      where: { user: { department: { company: { id: companyId } } }, date },
      relations: ['user', 'shift'],
    });
  }

  // Mobile App Critical Helper Methods
  async getTodayAttendance(userId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: today },
      relations: ['shift', 'user'],
    });
  }

  async getAttendanceHistory(
    userId: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const queryBuilder = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.shift', 'shift')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('attendance.user_id = :userId', { userId });

    if (startDate) {
      queryBuilder.andWhere('attendance.date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('attendance.date <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();

    const data = await queryBuilder
      .orderBy('attendance.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      page,
      limit,
      total,
    };
  }

  // Break Management Helper Methods
  async startBreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Check if user is checked in
    const attendance = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: today },
      relations: ['breaks'],
    });

    if (!attendance) {
      throw new BadRequestException('User has not checked in today');
    }

    if (attendance.check_out) {
      throw new BadRequestException('User has already checked out');
    }

    // Check if there's an active break
    const activeBreak = attendance.breaks?.find((b) => !b.break_end);
    if (activeBreak) {
      throw new BadRequestException('Break is already in progress');
    }

    // Create new break
    const newBreak = this.breakRepo.create({
      attendance,
      break_start: new Date(),
    });

    await this.breakRepo.save(newBreak);

    return {
      message: 'Break started successfully',
      data: newBreak,
    };
  }

  async endBreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: today },
      relations: ['breaks'],
    });

    if (!attendance) {
      throw new BadRequestException('User has not checked in today');
    }

    // Find active break
    const activeBreak = attendance.breaks?.find((b) => !b.break_end);
    if (!activeBreak) {
      throw new BadRequestException('No active break found');
    }

    // End the break
    activeBreak.break_end = new Date();
    await this.breakRepo.save(activeBreak);

    return {
      message: 'Break ended successfully',
      data: activeBreak,
    };
  }

  async getBreaks(attendanceId: string) {
    const breaks = await this.breakRepo.find({
      where: { attendance: { id: attendanceId } },
      order: { break_start: 'ASC' },
    });

    return {
      message: 'Breaks retrieved successfully',
      data: breaks,
    };
  }

  async getActiveBreak(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceRepo.findOne({
      where: { user: { id: userId }, date: today },
      relations: ['breaks'],
    });

    if (!attendance) {
      return { message: 'No attendance record found', data: null };
    }

    const activeBreak = attendance.breaks?.find((b) => !b.break_end);

    return {
      message: activeBreak ? 'Active break found' : 'No active break',
      data: activeBreak || null,
    };
  }

  // Mobile App Summary Methods
  async getDailySummary(userId: string, month: string, year: string) {
    // Format month to ensure 2 digits
    const formattedMonth = month.padStart(2, '0');
    const datePattern = `${year}-${formattedMonth}%`;

    const attendances = await this.attendanceRepo.find({
      where: {
        user: { id: userId },
        date: Like(datePattern),
      },
      order: { date: 'DESC' },
    });

    const summary = attendances.map((record) => {
      let totalHours = '-';
      let hoursValue = 0;

      if (record.check_in && record.check_out) {
        const diff =
          new Date(record.check_out).getTime() -
          new Date(record.check_in).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        totalHours = `${hours}h ${minutes}m`;
        hoursValue = diff / (1000 * 60 * 60);
      }

      // Format date for display (e.g., "October 3, 2024")
      const dateObj = new Date(record.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      // Format times
      const formatTime = (date: Date | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      };

      return {
        date: formattedDate,
        rawDate: record.date,
        isPresent: record.status === 'PRESENT' || record.status === 'LATE',
        status: record.status,
        checkIn: formatTime(record.check_in),
        checkOut: formatTime(record.check_out),
        totalHours,
        hoursValue,
      };
    });

    return {
      message: 'Daily summary retrieved successfully',
      data: summary,
    };
  }

  async getWeeklySummary(userId: string, year: string) {
    const datePattern = `${year}%`;

    const attendances = await this.attendanceRepo.find({
      where: {
        user: { id: userId },
        date: Like(datePattern),
      },
      order: { date: 'ASC' },
    });

    // Group by week
    const weeks: {
      [key: number]: {
        weekNumber: number;
        hoursWorked: number;
        missedDays: number;
        startDate: Date;
        endDate: Date;
      };
    } = {};

    attendances.forEach((record) => {
      const date = new Date(record.date);
      const weekNumber = this.getWeekNumber(date);

      if (!weeks[weekNumber]) {
        weeks[weekNumber] = {
          weekNumber,
          hoursWorked: 0,
          missedDays: 0,
          startDate: date, // Initialize with current date, will update
          endDate: date,
        };
      }

      // Update hours
      if (record.check_in && record.check_out) {
        const diff =
          new Date(record.check_out).getTime() -
          new Date(record.check_in).getTime();
        weeks[weekNumber].hoursWorked += diff / (1000 * 60 * 60);
      }

      // Track missed days (simplified logic: if status is ABSENT)
      if (record.status === 'ABSENT') {
        weeks[weekNumber].missedDays += 1;
      }
      
      // Update start/end dates for the week range
      if (date < weeks[weekNumber].startDate) weeks[weekNumber].startDate = date;
      if (date > weeks[weekNumber].endDate) weeks[weekNumber].endDate = date;
    });

    // Convert to array and format
    const summary = Object.values(weeks).map((week) => {
      return {
        weekLabel: `Week ${week.weekNumber}`,
        hoursWorked: Math.round(week.hoursWorked), // Round to nearest hour as per UI
        missedDays: week.missedDays,
        from: week.startDate,
        to: week.endDate,
      };
    });

    return {
      message: 'Weekly summary retrieved successfully',
      data: summary,
    };
  }

  private getWeekNumber(d: Date): number {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return weekNo;
  }
}
