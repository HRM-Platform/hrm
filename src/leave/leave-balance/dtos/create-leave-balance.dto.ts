import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateLeaveBalanceDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  leave_type_id: string;

  @IsInt()
  @Min(0)
  balance: number;
}
