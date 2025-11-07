import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReversalDto {
  @ApiProperty({ description: 'ID da transação original a reverter' })
  @IsUUID('4')
  transactionId!: string;
}
