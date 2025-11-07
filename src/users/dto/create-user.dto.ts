import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaSegura123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 100.00, required: false })
  @IsOptional()
  initialBalance?: number;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Se verdadeiro, tenta criar este usuário como o ÚNICO gerente do sistema'
  })
  @IsOptional()
  @IsBoolean()
  isManager?: boolean;
}
