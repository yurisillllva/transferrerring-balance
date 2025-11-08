import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()   T
  id!: number;

  @ManyToOne(() => User, (u) => u.outgoing, { eager: false })
  @JoinColumn({ name: 'fromUserId' })
  fromUser!: User;

  @ManyToOne(() => User, (u) => u.incoming, { eager: false })
  @JoinColumn({ name: 'toUserId' })
  toUser!: User;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: string;

  @Column({ length: 30 })
  type!: 'TRANSFER' | 'REVERSAL';

  @Column({ length: 30 })
  status!: 'COMPLETED' | 'REVERSED';

  @Column({ type: 'int', nullable: true })   
  reversalOf!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
