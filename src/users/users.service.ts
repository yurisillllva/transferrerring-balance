import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    if (dto.isManager) {
      const alreadyManager = await this.repo.count({ where: { isManager: true } });
      if (alreadyManager > 0) {
        throw new BadRequestException('Já existe um gerente cadastrado. Apenas um gerente é permitido.');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const u = this.repo.create({
      name: dto.name,
      email: dto.email,
      password: passwordHash,
      balance: (dto.initialBalance ?? 0).toFixed(2),
      isManager: !!dto.isManager,
    });
    return this.repo.save(u);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }

  async findById(id: number): Promise<User> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    return u;
  }

  async list(): Promise<User[]> {
    return this.repo.find();
  }
}
