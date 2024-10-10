import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class StatusUpdateService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka
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

  async processTransaction(transaction: any): Promise<void> {
    console.log('Received transaction status update:', transaction);
    // this.kafkaClient.emit('transaction_status_updated', JSON.stringify(result))
  }
}