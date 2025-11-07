import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: Repository },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    repo = moduleRef.get(getRepositoryToken(User));
  });

  it('não permite e-mail duplicado', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue({ id: '1' } as any);
    await expect(service.create({
      name: 'X', email: 'x@x.com', password: '123456'
    } as any)).rejects.toThrow('E-mail já cadastrado');
  });
});
