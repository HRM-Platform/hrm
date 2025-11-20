import { IsNotEmpty, IsString } from 'class-validator';

export class EndBreakDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
