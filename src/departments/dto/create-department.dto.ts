import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  company_id: string;
}
