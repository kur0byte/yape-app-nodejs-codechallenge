import { Injectable, Inject, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './Transaction.entity'; // Ensure correct import path

@Injectable()
export class StatusUpdateService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
    @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async onModuleInit() {
    const topics = ['transaction_status_updated']; // Add all topics you're subscribing to
    await this.connectWithRetry(topics);
  }

  private async connectWithRetry(topics: string[], maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        for (const topic of topics) {
          await this.kafkaClient.subscribeToResponseOf(topic);
        }
        await this.kafkaClient.connect();
        console.log('Successfully connected to Kafka');
        return;
      } catch (error) {
        console.error(`Failed to connect to Kafka (attempt ${attempt}/${maxRetries}):`, error.message);
        if (attempt === maxRetries) {
          console.error('Max retries reached. Failing to start the application.');
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
      }
    }
  }

  async updateStatus(transactionId: string, status: string): Promise<void> {
    await this.kafkaClient.emit('transaction-status-updated', { transactionId, status });
    // await this.cacheManager.set(`status:${transactionId}`, status, 60000); // Cache for 1 minute
  }

  async processTransaction(data: any): Promise<void> {
    console.log('Received transaction status update:', data);
    const { transactionExternalId, status} = data;
    await this.transactionRepository.update({ externalId: transactionExternalId }, { status });
    console.log('Transaction status updated');
    // await this.cacheManager.set(`status:${transactionId}`, status, 60000);
    // this.kafkaClient.emit('transaction_status_updated', JSON.stringify(result))
  }
  
  // async getStatus(transactionId: string): Promise<string | undefined> {
  //   const cachedStatus = await this.cacheManager.get<string>(`status:${transactionId}`);
  //   if (cachedStatus) {
  //     return cachedStatus;
  //   }
  //   const transaction = await this.transactionRepository.findOne({ where: { id: transactionId }, select: ['status'] });
  //   if (transaction) {
  //     await this.cacheManager.set(`status:${transactionId}`, transaction.status, 60000);
  //     return transaction.status;
  //   }
  //   return undefined;
  // }
}