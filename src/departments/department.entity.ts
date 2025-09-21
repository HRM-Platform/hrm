import { Company } from 'src/companies/company.entity';
import { LeaveRequest } from 'src/leave/leave-request/leave-request.entity';
import { Shift } from 'src/shifts/shift.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Company, (company) => company.departments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => User, (user) => user.department)
  @JoinColumn({ name: 'user_id' })
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Shift, (shift) => shift.department)
  @JoinColumn({ name: 'shift_id' })
  shifts: Shift[];

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.department)
  leaveRequests: LeaveRequest[];
}
