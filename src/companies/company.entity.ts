import { Department } from 'src/departments/department.entity';
import { LeaveRequest } from 'src/leave/leave-request/leave-request.entity';
import { LeaveType } from 'src/leave/leavetype/leave-type.entity';
import { Shift } from 'src/shifts/shift.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Department, (d) => d.company)
  departments: Department[];
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Shift, (shift) => shift.company)
  shifts: Shift[];

  @OneToMany(() => LeaveType, (leaveType) => leaveType.company)
  leaveTypes: LeaveType[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.company)
  leaveRequests: LeaveRequest[];
}
