import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Transaction } from '../wallet/transaction.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 160 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance!: string;

  @Column({ type: 'boolean', default: false })
  isManager!: boolean;

  @OneToMany(() => Transaction, (t) => t.fromUser)
  outgoing!: Transaction[];

  @OneToMany(() => Transaction, (t) => t.toUser)
  incoming!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
