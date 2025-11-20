import { Shift } from 'src/shifts/shift.entity';
import { User } from 'src/users/user.entity';
import { Break } from './break.entity';
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

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.attendance)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Shift, (shift) => shift.attendance)
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'timestamp', nullable: true })
  check_in: Date;

  @Column({ type: 'timestamp', nullable: true })
  check_out: Date;

  @Column({
    type: 'enum',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
    default: 'PRESENT',
  })
  status: string;

  @OneToMany(() => Break, (breakRecord) => breakRecord.attendance)
  breaks: Break[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
