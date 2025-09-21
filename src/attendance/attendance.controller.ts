import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dtos/check-in.dto';
import { CheckOutDto } from './dtos/check-out.dto';

@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto);
  }

  @Post('check-out')
  checkOut(@Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(dto);
  }

  @Get('user/:id')
  getUserAttendance(@Param('id') id: string) {
    return this.attendanceService.getUserAttendance(id);
  }

  @Get('department/:id')
  getDeptAttendance(@Param('id') id: string, @Query('date') date: string) {
    return this.attendanceService.getDepartmentAttendance(id, date);
  }

  @Get('company/:id')
  getCompanyAttendance(@Param('id') id: string, @Query('date') date: string) {
    return this.attendanceService.getCompanyAttendance(id, date);
  }
}
