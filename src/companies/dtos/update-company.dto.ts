import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
