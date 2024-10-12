import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AntiFraudService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka
  ) {}
  async onModuleInit() {
    const topics = ['transaction_created']; // Add all topics you're subscribing to
    await this.connectWithRetry(topics);
  }

  private async connectWithRetry(topics: string[], maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        for (const topic of topics) {
          await this.kafkaClient.subscribeToResponseOf(topic);
        }
        await this.kafkaClient.connect();
        Logger.log('Successfully connected to Kafka');
        return;
      } catch (error) {
        Logger.error(`Failed to connect to Kafka (attempt ${attempt}/${maxRetries}):`, error.message);
        if (attempt === maxRetries) {
          Logger.error('Max retries reached. Failing to start the application.');
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
      }
    }
  }

  async processTransaction(transaction: any): Promise<void> {
    const isFraudulent = this.detectFraud(transaction);
    const status = isFraudulent ? 'rejected' : 'approved';

    const result = {
      transactionExternalId: transaction.externalId,
      status: status,
    };

    this.kafkaClient.emit('transaction_status_updated', JSON.stringify(result))
  }

  private detectFraud(transaction: any): boolean {
    return transaction.value > 1000;
  }
}