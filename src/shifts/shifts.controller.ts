import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dtos/create-shift.dto';
import { UpdateShiftDto } from './dtos/update-shift.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftService: ShiftsService) {}

  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.shiftService.createShift(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftService.updateShift(id, dto);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.shiftService.getShift(id);
  }

  @Get()
  getAll() {
    return this.shiftService.getAllShifts();
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.shiftService.deleteShift(id);
  }
}
