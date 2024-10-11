import { Injectable, Inject, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './Transaction.entity'; // Ensure correct import path
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class StatusUpdateService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
    @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
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

  async handleStatusUpdate(data: any): Promise<void> {
    console.log('Received transaction status update:', data);
    const { transactionExternalId, status} = data;
    if (!transactionExternalId || !status) {
      console.error('Invalid message received');
      return;
    }
    if (status !== 'approved' && status !== 'rejected') {
      console.error('Invalid status received');
      return;
    }
    await this.transactionRepository.update({ externalId: transactionExternalId }, { status });
    await this.cacheManager.del(transactionExternalId);
    console.log('Transaction status updated');
  }
}