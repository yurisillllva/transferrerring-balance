import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    create(dto: CreateUserDto): Promise<User>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    findById(id: number): Promise<User>;
    list(): Promise<User[]>;
}
