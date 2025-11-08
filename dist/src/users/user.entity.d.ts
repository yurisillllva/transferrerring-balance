import { Transaction } from '../wallet/transaction.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    balance: string;
    isManager: boolean;
    outgoing: Transaction[];
    incoming: Transaction[];
    createdAt: Date;
    updatedAt: Date;
}
