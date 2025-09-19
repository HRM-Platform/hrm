// src/departments/departments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Company } from 'src/companies/company.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const company = await this.companyRepo.findOne({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const department = this.departmentRepo.create({
      name: dto.name,
      company,
    });
    return this.departmentRepo.save(department);
  }

  findAll(): Promise<Department[]> {
    return this.departmentRepo.find({ relations: ['company', 'users'] });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepo.findOne({
      where: { id },
      relations: ['company', 'users'],
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    if (dto.name) department.name = dto.name;

    if (dto.companyId) {
      const company = await this.companyRepo.findOne({
        where: { id: dto.companyId },
      });
      if (!company) throw new NotFoundException('Company not found');
      department.company = company;
    }

    return this.departmentRepo.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepo.remove(department);
  }
}
