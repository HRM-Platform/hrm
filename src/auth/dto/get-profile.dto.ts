import { IsInt } from 'class-validator';

export class GetProfileDto {
  @IsInt()
  id: number;
}
