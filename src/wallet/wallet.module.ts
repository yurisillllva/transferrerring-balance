import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Transaction } from './transaction.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User]), UsersModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
