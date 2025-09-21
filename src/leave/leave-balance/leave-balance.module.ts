import { Module } from '@nestjs/common';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveBalance } from './leave-balance.entity';
import { LeaveType } from '../leavetype/leave-type.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveBalance, LeaveType, User])],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
