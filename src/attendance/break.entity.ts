import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity('breaks')
export class Break {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Attendance, (attendance) => attendance.breaks)
  @JoinColumn({ name: 'attendance_id' })
  attendance: Attendance;

  @Column({ type: 'timestamp' })
  break_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  break_end: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
