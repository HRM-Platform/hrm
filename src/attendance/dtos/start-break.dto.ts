import { IsNotEmpty, IsString } from 'class-validator';

export class StartBreakDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
