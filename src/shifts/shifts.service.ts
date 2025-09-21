import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShiftDto } from './dtos/create-shift.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shift } from './shift.entity';
import { Repository } from 'typeorm';
import { Company } from 'src/companies/company.entity';
import { Department } from 'src/departments/department.entity';
import { UpdateShiftDto } from './dtos/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftRepo: Repository<Shift>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {}

  async createShift(dto: CreateShiftDto) {
    const company = await this.getCompany(dto.company_id);
    const department = dto.department_id
      ? await this.getDepartment(dto.department_id)
      : null;

    this.validateShiftTime(dto.start_time, dto.end_time);

    const shiftData = this.buildShiftData(dto, company, department);
    const shift = this.shiftRepo.create(shiftData);

    return this.shiftRepo.save(shift);
  }

  private async getCompany(companyId: string) {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  private async getDepartment(departmentId: string) {
    const department = await this.departmentRepo.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  private validateShiftTime(startTime: string, endTime: string) {
    if (startTime >= endTime) {
      throw new BadRequestException('Shift startTime must be before endTime');
    }
  }

  private buildShiftData(
    dto: CreateShiftDto,
    company: Company,
    department: Department | null,
  ): Partial<Shift> {
    const shiftData: Partial<Shift> = {
      name: dto.name,
      company,
      start_time: dto.start_time,
      end_time: dto.end_time,
      grace_period: dto.grace_period || 15,
    };

    if (department) {
      shiftData.department = department;
    }

    return shiftData;
  }

  async updateShift(id: string, dto: UpdateShiftDto) {
    const shift = await this.shiftRepo.findOne({ where: { id } });
    if (!shift) throw new NotFoundException('Shift not found');
    if (dto.start_time && dto.end_time && dto.start_time >= dto.end_time) {
      throw new BadRequestException('Shift startTime must be before endTime');
    }

    Object.assign(shift, dto);
    return this.shiftRepo.save(shift);
  }

  async getShift(id: string) {
    const shift = await this.shiftRepo.findOne({
      where: { id },
      relations: ['company', 'department'],
    });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async getAllShifts() {
    return this.shiftRepo.find({ relations: ['company', 'department'] });
  }

  async deleteShift(id: string) {
    const shift = await this.shiftRepo.findOne({ where: { id } });
    if (!shift) throw new NotFoundException('Shift not found');
    return this.shiftRepo.remove(shift);
  }
}