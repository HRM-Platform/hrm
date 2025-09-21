import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LeavetypeService } from './leavetype.service';
import { CreateLeaveTypeDto } from './dtos/create-leave-type.dto';

@Controller('leave-types')
export class LeavetypeController {
  constructor(private readonly service: LeavetypeService) {}

  @Post()
  create(@Body() dto: CreateLeaveTypeDto) {
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
