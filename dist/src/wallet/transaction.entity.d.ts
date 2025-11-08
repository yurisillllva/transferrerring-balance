import { User } from '../users/user.entity';
export declare class Transaction {
    T: any;
    id: number;
    fromUser: User;
    toUser: User;
    amount: string;
    type: 'TRANSFER' | 'REVERSAL';
    status: 'COMPLETED' | 'REVERSED';
    reversalOf: number | null;
    createdAt: Date;
    updatedAt: Date;
}
