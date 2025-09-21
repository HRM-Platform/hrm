import { IsUUID, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  company_id: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultDays?: number;
}
