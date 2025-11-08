"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./transaction.entity");
const user_entity_1 = require("../users/user.entity");
let WalletService = class WalletService {
    constructor(txRepo, userRepo, dataSource) {
        this.txRepo = txRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
    }
    async assertManager(userId) {
        const u = await this.userRepo.findOne({ where: { id: userId } });
        if (!u)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (!u.isManager)
            throw new common_1.ForbiddenException('Apenas o gerente pode executar esta operação');
        return u;
    }
    async transfer(managerId, fromUserId, toUserId, amount) {
        if (fromUserId === toUserId)
            throw new common_1.BadRequestException('Origem e destino não podem ser o mesmo usuário');
        if (amount <= 0)
            throw new common_1.BadRequestException('Valor inválido');
        await this.assertManager(managerId);
        return this.dataSource.transaction(async (managerTx) => {
            const repoU = managerTx.getRepository(user_entity_1.User);
            const ids = [fromUserId, toUserId].sort((a, b) => a - b);
            const u1 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[0] }).getOne();
            const u2 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[1] }).getOne();
            if (!u1 || !u2)
                throw new common_1.NotFoundException('Usuário origem/destino não encontrado');
            const from = (u1.id === fromUserId) ? u1 : u2;
            const to = (u1.id === toUserId) ? u1 : u2;
            const fromBalance = Number(from.balance);
            if (fromBalance < amount)
                throw new common_1.ForbiddenException('Saldo insuficiente no usuário de origem');
            await repoU.update(from.id, { balance: (fromBalance - amount).toFixed(2) });
            await repoU.update(to.id, { balance: (Number(to.balance) + amount).toFixed(2) });
            const tx = managerTx.getRepository(transaction_entity_1.Transaction).create({
                fromUser: from, toUser: to,
                amount: amount.toFixed(2), type: 'TRANSFER', status: 'COMPLETED'
            });
            return managerTx.getRepository(transaction_entity_1.Transaction).save(tx);
        });
    }
    async withdraw(managerId, fromUserId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Valor inválido');
        const manager = await this.assertManager(managerId);
        return this.transfer(manager.id, fromUserId, manager.id, amount);
    }
    async reverse(managerId, transactionId) {
        await this.assertManager(managerId);
        const original = await this.txRepo.findOne({
            where: { id: transactionId },
            relations: ['fromUser', 'toUser'],
        });
        if (!original)
            throw new common_1.NotFoundException('Transação não encontrada');
        if (original.type !== 'TRANSFER')
            throw new common_1.BadRequestException('Apenas transferências podem ser revertidas');
        if (original.status === 'REVERSED')
            throw new common_1.BadRequestException('Transação já revertida');
        const amount = Number(original.amount);
        return this.dataSource.transaction(async (managerTx) => {
            const repoU = managerTx.getRepository(user_entity_1.User);
            const fromId = original.fromUser.id;
            const toId = original.toUser.id;
            const ids = [fromId, toId].sort((a, b) => a - b);
            const u1 = await repoU
                .createQueryBuilder('u')
                .setLock('pessimistic_write')
                .where('u.id = :id', { id: ids[0] })
                .getOne();
            const u2 = await repoU
                .createQueryBuilder('u')
                .setLock('pessimistic_write')
                .where('u.id = :id', { id: ids[1] })
                .getOne();
            const from = u1.id === fromId ? u1 : u2;
            const to = u1.id === toId ? u1 : u2;
            const toBalance = Number(to.balance);
            if (toBalance < amount)
                throw new common_1.ForbiddenException('Recebedor não possui saldo suficiente para reversão');
            await repoU.update(to.id, { balance: (toBalance - amount).toFixed(2) });
            await repoU.update(from.id, { balance: (Number(from.balance) + amount).toFixed(2) });
            await managerTx.getRepository(transaction_entity_1.Transaction).update(original.id, {
                status: 'REVERSED',
            });
            const rev = managerTx.getRepository(transaction_entity_1.Transaction).create({
                fromUser: to,
                toUser: from,
                amount: amount.toFixed(2),
                type: 'REVERSAL',
                status: 'COMPLETED',
                reversalOf: original.id,
            });
            return managerTx.getRepository(transaction_entity_1.Transaction).save(rev);
        });
    }
    async listByUser(userId) {
        return this.txRepo.find({
            where: [
                { fromUser: { id: userId } },
                { toUser: { id: userId } },
            ],
            relations: ['fromUser', 'toUser'],
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], WalletService);
