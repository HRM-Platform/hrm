import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateLeaveBalanceDto } from './dtos/create-leave-balance.dto';
import { LeaveBalanceService } from './leave-balance.service';

@Controller('leave-balances')
export class LeaveBalanceController {
  constructor(private readonly service: LeaveBalanceService) {}

  @Post()
  create(@Body() dto: CreateLeaveBalanceDto) {
    return this.service.create(dto);
  }
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
