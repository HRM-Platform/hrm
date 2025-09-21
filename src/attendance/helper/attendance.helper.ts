// src/attendance/helpers/attendance.helper.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Shift } from 'src/shifts/shift.entity';
import { Attendance } from '../attendance.entity';
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
    const shift = await this.shiftRepo.findOne({
      where: { department: { id: user.department!.company.id } },
    });
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
    if ((attendance as any).checkOut)
      throw new BadRequestException('User already checked out today');

    attendance['checkOut'] = new Date();
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
}
