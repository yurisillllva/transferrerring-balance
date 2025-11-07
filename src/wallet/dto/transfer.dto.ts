import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsPositive, IsNumber } from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'ID do usuário destino (recebedor)' })
  @IsUUID('4')
  toUserId!: string;

  @ApiProperty({ description: 'Valor a transferir', example: 50.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}
