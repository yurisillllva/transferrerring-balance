import { User } from '../users/user.entity';
export type TxType = 'TRANSFER' | 'REVERSAL';
export type TxStatus = 'COMPLETED' | 'REVERSED';
export declare class Transaction {
    id: number;
    fromUser: User | null;
    toUser: User | null;
    amount: string;
    type: TxType;
    status: TxStatus;
    reversalOf: number | null;
    createdAt: Date;
    updatedAt: Date;
}
