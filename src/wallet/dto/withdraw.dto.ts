import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsNumber, IsPositive } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  fromUserId!: number;

  @ApiProperty({ example: 50.5 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}
