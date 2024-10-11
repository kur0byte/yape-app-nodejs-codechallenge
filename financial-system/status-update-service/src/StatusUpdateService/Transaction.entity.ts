import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  externalId: string;

  @Column({ type: 'uuid' })
  accountExternalIdDebit: string;

  @Column({ type: 'uuid' })
  accountExternalIdCredit: string;

  @Column()
  tranferTypeId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column()
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
