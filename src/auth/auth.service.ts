import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(password, (user as any).password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'secret',
        expiresIn: process.env.JWT_EXPIRES || '1d',
      }),
    };
  }
}
