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
  ) {}

  private async assertManager(userId: string) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('Usuário não encontrado');
    if (!u.isManager) throw new ForbiddenException('Apenas o gerente pode executar esta operação');
    return u;
  }

  /**
   * Gerente transfere do saldo dele para outro usuário.
   */
  async transfer(managerId: string, toUserId: string, amount: number) {
    if (managerId === toUserId) throw new BadRequestException('Não é permitido transferir para si mesmo');
    if (amount <= 0) throw new BadRequestException('Valor inválido');

    // Garante que quem chamou é gerente
    const manager = await this.assertManager(managerId);

    return this.dataSource.transaction(async (managerTx) => {
      // Lock pessimista nas linhas
      const from = await managerTx.getRepository(User).createQueryBuilder('u')
        .setLock('pessimistic_write').where('u.id = :id', { id: manager.id }).getOne();
      const to = await managerTx.getRepository(User).createQueryBuilder('u')
        .setLock('pessimistic_write').where('u.id = :id', { id: toUserId }).getOne();

      if (!to) throw new NotFoundException('Destinatário não encontrado');

      const fromBalance = Number(from!.balance);
      if (fromBalance < amount) throw new ForbiddenException('Saldo do gerente insuficiente');

      await managerTx.getRepository(User).update(from!.id, { balance: (fromBalance - amount).toFixed(2) });
      await managerTx.getRepository(User).update(to.id, { balance: (Number(to.balance) + amount).toFixed(2) });

      const tx = managerTx.getRepository(Transaction).create({
        fromUser: from!, toUser: to,
        amount: amount.toFixed(2), type: 'TRANSFER', status: 'COMPLETED'
      });
      return managerTx.getRepository(Transaction).save(tx);
    });
  }

  /**
   * Gerente retira saldo de um usuário e credita no saldo do gerente.
   */
  async withdraw(managerId: string, fromUserId: string, amount: number) {
    if (managerId === fromUserId) throw new BadRequestException('Use /wallet/transfer para transferir para terceiros');
    if (amount <= 0) throw new BadRequestException('Valor inválido');

    const manager = await this.assertManager(managerId);

    return this.dataSource.transaction(async (managerTx) => {
      const repoU = managerTx.getRepository(User);

      // Ordena ids para lock determinístico
      const ids = [manager.id, fromUserId].sort();

      const u1 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[0] }).getOne();
      const u2 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[1] }).getOne();

      const from = (u1!.id === fromUserId) ? u1! : u2!;
      const toManager = (u1!.id === manager.id) ? u1! : u2!;

      if (!from) throw new NotFoundException('Usuário de origem não encontrado');

      const fromBalance = Number(from.balance);
      if (fromBalance < amount) throw new ForbiddenException('Usuário não possui saldo suficiente');

      await repoU.update(from.id, { balance: (fromBalance - amount).toFixed(2) });
      await repoU.update(toManager.id, { balance: (Number(toManager.balance) + amount).toFixed(2) });

      const tx = managerTx.getRepository(Transaction).create({
        fromUser: from, toUser: toManager,
        amount: amount.toFixed(2), type: 'TRANSFER', status: 'COMPLETED'
      });
      return managerTx.getRepository(Transaction).save(tx);
    });
  }

  /**
   * Reversão: somente o gerente pode reverter.
   * Aplica estorno (debita quem recebeu e credita quem enviou).
   */
  async reverse(managerId: string, transactionId: string) {
    await this.assertManager(managerId);

    const original = await this.txRepo.findOne({
      where: { id: transactionId },
      relations: ['fromUser', 'toUser'],
    });
    if (!original) throw new NotFoundException('Transação não encontrada');
    if (original.type !== 'TRANSFER') throw new BadRequestException('Apenas transferências podem ser revertidas');
    if (original.status === 'REVERSED') throw new BadRequestException('Transação já revertida');

    const amount = Number(original.amount);

    return this.dataSource.transaction(async (managerTx) => {
      const repoU = managerTx.getRepository(User);

      // Lock determinístico nas contas
      const ids = [original.fromUser?.id!, original.toUser?.id!].sort();
      const u1 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[0] }).getOne();
      const u2 = await repoU.createQueryBuilder('u').setLock('pessimistic_write').where('u.id = :id', { id: ids[1] }).getOne();

      const from = (u1!.id === original.fromUser?.id) ? u1! : u2!;
      const to = (u1!.id === original.toUser?.id) ? u1! : u2!;

      // Debita quem recebeu e credita quem enviou
      const toBalance = Number(to.balance);
      if (toBalance < amount) throw new ForbiddenException('Recebedor não possui saldo suficiente para a reversão');

      await repoU.update(to.id, { balance: (toBalance - amount).toFixed(2) });
      await repoU.update(from.id, { balance: (Number(from.balance) + amount).toFixed(2) });

      await managerTx.getRepository(Transaction).update(original.id, { status: 'REVERSED' });

      const rev = managerTx.getRepository(Transaction).create({
        fromUser: to, toUser: from,
        amount: amount.toFixed(2), type: 'REVERSAL', status: 'COMPLETED',
        reversalOf: original.id,
      });
      return managerTx.getRepository(Transaction).save(rev);
    });
  }

  async listByUser(userId: string) {
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
