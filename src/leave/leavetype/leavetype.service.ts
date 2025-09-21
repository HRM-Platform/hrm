import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaveTypeDto } from './dtos/create-leave-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveType } from './leave-type.entity';
import { Repository } from 'typeorm';
import { Company } from 'src/companies/company.entity';

@Injectable()
export class LeavetypeService {
  constructor(
    @InjectRepository(LeaveType)
    private repo: Repository<LeaveType>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateLeaveTypeDto) {
    const company = await this.companyRepo.findOne({
      where: { id: dto.company_id },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existing = await this.repo.findOne({
      where: { name: dto.name, company: { id: company.id } },
    });
    if (existing) {
      throw new BadRequestException(
        `Leave type "${dto.name}" already exists for this company`,
      );
    }

    const leaveType = this.repo.create({
      ...dto,
      company,
    });

    return this.repo.save(leaveType);
  }

  findAll() {
    return this.repo.find({ relations: ['company'] });
  }

  async findOne(id: string) {
    const type = await this.repo.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!type) throw new NotFoundException('Leave type not found');
    return type;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
