import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  companyId: string;
}
