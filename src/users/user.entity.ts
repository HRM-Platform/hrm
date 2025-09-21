// src/users/user.entity.ts
import { Exclude } from 'class-transformer';
import { Attendance } from 'src/attendance/attendance.entity';
import { Company } from 'src/companies/company.entity';
import { Department } from 'src/departments/department.entity';
import { LeaveBalance } from 'src/leave/leave-balance/leave-balance.entity';
import { LeaveRequest } from 'src/leave/leave-request/leave-request.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['employee', 'manager', 'admin', 'super_admin'],
    default: 'employee',
  })
  role: string;

  @ManyToOne(() => Department, (department) => department.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ name: 'first_name' })
  first_name: string;

  @Column({ name: 'last_name' })
  last_name: string;

  @Column({ default: false })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendance: Attendance[];

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.user)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
  leaveRequests: LeaveRequest[];
}
