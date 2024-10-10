import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './Transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      externalId: uuidv4(),
      status: 'pending',
    });

    await this.transactionRepository.save(transaction);

    this.kafkaClient.emit('transaction_created', JSON.stringify(transaction));
    console.log('Transaction created:', transaction);
    return transaction;
  }

  async findOne(id: string): Promise<Transaction> {
    return await this.transactionRepository.findOne({where: {externalId: id}});
  }
}