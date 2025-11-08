import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsNumber, IsPositive } from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'ID do usuário origem (quem será debitado)', example: 2 })
  @IsInt()
  @Min(1)
  fromUserId!: number;

  @ApiProperty({ description: 'ID do usuário destino (quem será creditado)', example: 3 })
  @IsInt()
  @Min(1)
  toUserId!: number;

  @ApiProperty({ description: 'Valor a transferir', example: 50.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}
