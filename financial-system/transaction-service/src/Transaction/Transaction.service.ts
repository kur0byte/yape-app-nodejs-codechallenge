import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './Transaction.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      externalId: uuidv4(),
      status: 'pending',
    });
    
    await this.cacheManager.set(transaction.externalId, transaction);
    await this.transactionRepository.save(transaction);
    
    this.kafkaClient.emit('transaction_created', JSON.stringify(transaction));
    console.log('Transaction created:', transaction);
    return transaction;
  }

  async findOne(id: string): Promise<Transaction> {
    const cachedTransaction = await this.cacheManager.get<Transaction>(id)
    if (cachedTransaction) {
      return cachedTransaction
    } 
    return await this.transactionRepository.findOne({where: {externalId: id}});
  }
}