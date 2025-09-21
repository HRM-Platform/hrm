import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalance } from './leave-balance.entity';
import { CreateLeaveBalanceDto } from './dtos/create-leave-balance.dto';
import { User } from 'src/users/user.entity';
import { LeaveType } from '../leavetype/leave-type.entity';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectRepository(LeaveBalance)
    private repo: Repository<LeaveBalance>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
  ) {}

  async create(dto: CreateLeaveBalanceDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const leaveType = await this.leaveTypeRepo.findOne({
      where: { id: dto.leave_type_id },
    });
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const existing = await this.repo.findOne({
      where: { user: { id: user.id }, leaveType: { id: leaveType.id } },
    });
    if (existing) {
      throw new BadRequestException(
        'Leave balance for this user and type already exists',
      );
    }

    const balance = this.repo.create({
      balance: dto.balance,
      user,
      leaveType,
    });

    return this.repo.save(balance);
  }

  findAll() {
    return this.repo.find({ relations: ['user', 'leaveType'] });
  }

  async findOne(id: string) {
    const balance = await this.repo.findOne({
      where: { id },
      relations: ['user', 'leaveType'],
    });
    if (!balance) throw new NotFoundException('Leave balance not found');
    return balance;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
