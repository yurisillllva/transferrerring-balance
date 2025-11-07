import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type TxType = 'TRANSFER' | 'REVERSAL';
export type TxStatus = 'COMPLETED' | 'REVERSED';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.outgoing, { nullable: true, onDelete: 'SET NULL' })
  fromUser!: User | null;

  @ManyToOne(() => User, (u) => u.incoming, { nullable: true, onDelete: 'SET NULL' })
  toUser!: User | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 16 })
  type!: TxType;

  @Column({ type: 'varchar', length: 16 })
  status!: TxStatus;

  @Column({ type: 'uuid', nullable: true })
  reversalOf?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
