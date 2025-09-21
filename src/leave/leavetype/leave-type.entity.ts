// leave-type.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Company } from 'src/companies/company.entity';
import { LeaveBalance } from '../leave-balance/leave-balance.entity';
import { LeaveRequest } from '../leave-request/leave-request.entity';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => Company, (company) => company.leaveTypes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'default_days', type: 'int', default: 0 })
  defaultDays: number;

  @OneToMany(() => LeaveBalance, (balance) => balance.leaveType)
  leaveBalances: LeaveBalance[];

  @OneToMany(() => LeaveRequest, (request) => request.leaveType)
  leaveRequests: LeaveRequest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
