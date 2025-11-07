import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsPositive, IsNumber } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ description: 'ID do usuário de quem o gerente vai retirar o saldo' })
  @IsUUID('4')
  fromUserId!: string;

  @ApiProperty({ description: 'Valor a retirar', example: 50.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}
