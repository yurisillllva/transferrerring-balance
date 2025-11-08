import { WalletService } from './wallet.service';
import { TransferDto } from './dto/transfer.dto';
import { ReversalDto } from './dto/reversal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
export declare class WalletController {
    private readonly service;
    constructor(service: WalletService);
    transfer(req: any, dto: TransferDto): Promise<import("./transaction.entity").Transaction>;
    withdraw(req: any, dto: WithdrawDto): Promise<import("./transaction.entity").Transaction>;
    reverse(req: any, dto: ReversalDto): Promise<import("./transaction.entity").Transaction>;
    list(userId: number): Promise<import("./transaction.entity").Transaction[]>;
}
