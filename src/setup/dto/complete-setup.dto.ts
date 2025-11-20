import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CompleteSetupDto {
  // Company Details
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  company_address?: string;

  // Department Details
  @IsNotEmpty()
  @IsString()
  department_name: string;

  @IsOptional()
  @IsString()
  department_description?: string;

  // Shift Details
  @IsNotEmpty()
  @IsString()
  shift_name: string;

  @IsNotEmpty()
  @IsString()
  shift_start_time: string;

  @IsNotEmpty()
  @IsString()
  shift_end_time: string;

  @IsOptional()
  grace_period?: number;

  // User Details
  @IsNotEmpty()
  @IsEmail()
  user_email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  user_password: string;

  @IsNotEmpty()
  @IsString()
  user_first_name: string;

  @IsNotEmpty()
  @IsString()
  user_last_name: string;

  @IsOptional()
  @IsString()
  user_role?: 'employee' | 'manager' | 'admin' | 'super_admin';
}
