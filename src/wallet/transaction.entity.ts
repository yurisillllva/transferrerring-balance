import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export type TxType = 'TRANSFER' | 'REVERSAL';
export type TxStatus = 'COMPLETED' | 'REVERSED';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @ManyToOne(() => User, (u) => u.outgoing, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser!: User | null;

  @ManyToOne(() => User, (u) => u.incoming, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'toUserId' })
  toUser!: User | null;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 16 })
  @Index()
  type!: TxType;

  @Column({ type: 'varchar', length: 16 })
  @Index()
  status!: TxStatus;

  @Column({ type: 'int', nullable: true })
  reversalOf!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
