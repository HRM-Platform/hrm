import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignDepartmentDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  department_id: string;
}
