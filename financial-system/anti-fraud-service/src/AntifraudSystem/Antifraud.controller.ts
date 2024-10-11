import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern,Payload } from '@nestjs/microservices';
import { AntiFraudService } from './Antifraud.service';

@Controller()
export class AntiFraudController {
  constructor(private readonly antiFraudService: AntiFraudService) {}

  @MessagePattern('transaction_created')
  async handleTransactionCreated(@Payload() message: any) {
    try {
      console.log('Received transaction:', message);
      await this.antiFraudService.processTransaction(message);
      console.log('Transaction processed');
    } catch (error) {
      console.error('Failed to process transaction:', error);
    }
  }
}