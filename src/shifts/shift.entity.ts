import { time } from 'console';
import { Attendance } from 'src/attendance/attendance.entity';
import { Company } from 'src/companies/company.entity';
import { Department } from 'src/departments/department.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Company, (c) => c.shifts)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, (d) => d.shifts, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @OneToMany(() => Attendance, (attendance) => attendance.user)
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance[];

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'int', default: 15 })
  grace_period: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
