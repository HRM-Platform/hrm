import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly first_name: string;

  @IsOptional()
  @IsString()
  readonly last_name: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;
}
