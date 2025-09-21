import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { LeaveStatus } from '../leave-request.entity';

export class CreateLeaveRequestDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  company_id: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsUUID()
  leave_type_id: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;
}
