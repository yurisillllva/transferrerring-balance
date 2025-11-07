import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso', type: User })
  async create(@Body() dto: CreateUserDto) {
    const u = await this.service.create(dto);
    // Oculta password
    const { password, ...safe } = u as any;
    return safe;
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de usuários', type: [User] })
  async list() {
    return this.service.list();
  }
}
