import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveRequest } from './leave-request.entity';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLeaveRequestDto } from './dtos/create-leave-request.dto';
import { User } from 'src/users/user.entity';
import { Company } from 'src/companies/company.entity';
import { Department } from 'src/departments/department.entity';
import { LeaveType } from '../leavetype/leave-type.entity';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly repo: Repository<LeaveRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>,
  ) {}

  async create(dto: CreateLeaveRequestDto) {
    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);

    // Fetch all entities in parallel
    const [user, company, department, leaveType] = await Promise.all([
      this.getUser(dto.user_id),
      this.getCompany(dto.company_id),
      dto.department_id
        ? this.getDepartment(dto.department_id)
        : Promise.resolve(undefined),
      this.getLeaveType(dto.leave_type_id),
    ]);

    await this.checkOverlappingLeave(user.id, start, end);

    const leaveRequest = this.buildLeaveRequest(
      dto,
      user,
      company,
      department,
      leaveType,
      start,
      end,
    );

    return this.repo.save(leaveRequest);
  }

  private buildLeaveRequest(
    dto: CreateLeaveRequestDto,
    user: User,
    company: Company,
    department: Department | undefined,
    leaveType: LeaveType,
    start: Date,
    end: Date,
  ): LeaveRequest {
    return this.repo.create({
      start_date: start,
      end_date: end,
      reason: dto.reason,
      status: dto.status ?? 'PENDING',
      user,
      company,
      department,
      leaveType,
    });
  }

  private async getUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
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

  private async getLeaveType(leaveTypeId: string) {
    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id: leaveTypeId },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');
    return leaveType;
  }

  private async checkOverlappingLeave(userId: string, start: Date, end: Date) {
    const overlapping = await this.repo.findOne({
      where: {
        user: { id: userId },
        status: 'PENDING',
        start_date: LessThanOrEqual(end),
        end_date: MoreThanOrEqual(start),
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'User already has a leave request in this date range',
      );
    }
  }

  async findAll() {
    return this.repo.find({
      relations: ['user', 'company', 'department', 'leaveType'],
    });
  }

  async findOne(id: string) {
    const leaveRequest = await this.repo.findOne({
      where: { id },
      relations: ['user', 'company', 'department', 'leaveType'],
    });
    if (!leaveRequest) throw new NotFoundException('Leave request not found');
    return leaveRequest;
  }

  async remove(id: string) {
    const leaveRequest = await this.findOne(id);
    return this.repo.remove(leaveRequest);
  }
}
