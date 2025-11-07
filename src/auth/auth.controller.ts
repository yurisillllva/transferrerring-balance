import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  @ApiOkResponse({ description: 'Login com JWT' })
  async login(@Body() dto: LoginDto) {
    const user = await this.service.validateUser(dto.email, dto.password);
    return this.service.login(user);
  }
}
