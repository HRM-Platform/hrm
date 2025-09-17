import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetProfileDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;
}
