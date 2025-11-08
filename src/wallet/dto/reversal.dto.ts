import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReversalDto {
  @ApiProperty({ description: 'ID numérico da transação a reverter', example: 6 })
  @IsInt()
  @Min(1)
  transactionId!: number;
}
