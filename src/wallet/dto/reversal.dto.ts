import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReversalDto {
  @ApiProperty({ example: 3, description: 'ID da transação original' })
  @IsInt()
  @Min(1)
  transactionId!: number;
}
