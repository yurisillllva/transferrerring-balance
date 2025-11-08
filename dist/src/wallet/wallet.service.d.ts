import { DataSource, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../users/user.entity';
export declare class WalletService {
    private readonly txRepo;
    private readonly userRepo;
    private readonly dataSource;
    constructor(txRepo: Repository<Transaction>, userRepo: Repository<User>, dataSource: DataSource);
    private assertManager;
    transfer(managerId: number, fromUserId: number, toUserId: number, amount: number): Promise<Transaction>;
    withdraw(managerId: number, fromUserId: number, amount: number): Promise<Transaction>;
    reverse(managerId: number, transactionId: number): Promise<Transaction>;
    listByUser(userId: number): Promise<Transaction[]>;
}
