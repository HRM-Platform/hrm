import { IsNotEmpty } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  user_id: string;
}
