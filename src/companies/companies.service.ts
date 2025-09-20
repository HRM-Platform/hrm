import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(name: string) {
    const existing = await this.companyRepo.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException('Company name already exists');
    }

    const company = this.companyRepo.create({ name });
    return this.companyRepo.save(company);
  }

  async findAll() {
    return this.companyRepo.find({ relations: ['departments'] });
  }

  async findOne(id: string) {
    const company = await this.companyRepo.findOne({
      where: { id: id },
      relations: ['departments'],
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, name: string) {
    const company = await this.findOne(id);
    company.name = name;
    return this.companyRepo.save(company);
  }

  async delete(id: string) {
    const company = await this.findOne(id);
    return this.companyRepo.remove(company);
  }
}
