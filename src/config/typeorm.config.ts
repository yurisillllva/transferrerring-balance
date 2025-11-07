import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../wallet/transaction.entity';

export const typeOrmConfig = async (): Promise<TypeOrmModuleOptions> => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'wallet',
  entities: [User, Transaction],
  synchronize: true, 
  extra: { connectionLimit: 10 }
});
