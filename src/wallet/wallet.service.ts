import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../users/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) { }

  private async assertManager(userId: number) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    if (!u.isManager) throw new ForbiddenException('Apenas o gerente pode executar esta operação');
    return u;
  }

  /**
   * TRANSFER: gerente ordena transferir de A -> B (A é debitado; B é creditado)
   */
  async transfer(managerId: number, fromUserId: number, toUserId: number, amount: number) {
    if (fromUserId === toUserId) throw new BadRequestException('Origem e destino não podem ser o mesmo usuário');
    if (amount <= 0) throw new BadRequestException('Valor inválido');
    await this.assertManager(managerId);

    return this.dataSource.transaction(async (managerTx) => {
      const repoU = managerTx.getRepository(User);

      // Lock determinístico evita deadlock
      const ids = [fromUserId, toUserId].sort((a, b) => a - b);

      const u1 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[0] }).getOne();
      const u2 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[1] }).getOne();

      if (!u1 || !u2) throw new NotFoundException('Usuário origem/destino não encontrado');

      const from = (u1.id === fromUserId) ? u1 : u2;
      const to = (u1.id === toUserId) ? u1 : u2;

      const fromBalance = Number(from.balance);
      if (fromBalance < amount) throw new ForbiddenException('Saldo insuficiente no usuário de origem');

      await repoU.update(from.id, { balance: (fromBalance - amount).toFixed(2) });
      await repoU.update(to.id, { balance: (Number(to.balance) + amount).toFixed(2) });

      const tx = managerTx.getRepository(Transaction).create({
        fromUser: from, toUser: to,
        amount: amount.toFixed(2), type: 'TRANSFER', status: 'COMPLETED'
      });
      return managerTx.getRepository(Transaction).save(tx);
    });
  }

  /**
   * WITHDRAW: gerente retira de X -> gerente (atalho usando transfer)
   */
  async withdraw(managerId: number, fromUserId: number, amount: number) {
    if (amount <= 0) throw new BadRequestException('Valor inválido');
    const manager = await this.assertManager(managerId);
    return this.transfer(manager.id, fromUserId, manager.id, amount);
  }

  /**
   * REVERSE: somente o gerente pode reverter uma transferência
   */
  async reverse(managerId: number, transactionId: number) {
    await this.assertManager(managerId);

    const original = await this.txRepo.findOne({
      where: { id: transactionId },
      relations: ['fromUser', 'toUser'],
    });

    if (!original) throw new NotFoundException('Transação não encontrada');
    if (original.type !== 'TRANSFER')
      throw new BadRequestException('Apenas transferências podem ser revertidas');
    if (original.status === 'REVERSED')
      throw new BadRequestException('Transação já revertida');

    const amount = Number(original.amount);

    return this.dataSource.transaction(async (managerTx) => {
      const repoU = managerTx.getRepository(User);

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

      const from = u1!.id === fromId ? u1! : u2!;
      const to = u1!.id === toId ? u1! : u2!;

      const toBalance = Number(to.balance);
      if (toBalance < amount)
        throw new ForbiddenException('Recebedor não possui saldo suficiente para reversão');

      await repoU.update(to.id, { balance: (toBalance - amount).toFixed(2) });
      await repoU.update(from.id, { balance: (Number(from.balance) + amount).toFixed(2) });

      await managerTx.getRepository(Transaction).update(original.id, {
        status: 'REVERSED',
      });

      const rev = managerTx.getRepository(Transaction).create({
        fromUser: to,
        toUser: from,
        amount: amount.toFixed(2),
        type: 'REVERSAL',
        status: 'COMPLETED',
        reversalOf: original.id, // AGORA É NUMBER
      });

      return managerTx.getRepository(Transaction).save(rev);
    });
  }


  async listByUser(userId: number) {
    return this.txRepo.find({
      where: [
        { fromUser: { id: userId } as any },
        { toUser: { id: userId } as any },
      ],
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
