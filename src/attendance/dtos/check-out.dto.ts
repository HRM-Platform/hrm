import { IsNotEmpty } from 'class-validator';

export class CheckOutDto {
  @IsNotEmpty()
  user_id: string;
}
