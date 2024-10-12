import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern,Payload } from '@nestjs/microservices';
import { AntiFraudService } from './Antifraud.service';

@Controller()
export class AntiFraudController {
  constructor(private readonly antiFraudService: AntiFraudService) {}

  @MessagePattern('transaction_created')
  async handleTransactionCreated(@Payload() message: any) {
    try {
      Logger.log('Received transaction:', message);
      await this.antiFraudService.processTransaction(message);
      Logger.log('Transaction processed');
    } catch (error) {
      Logger.error('Failed to process transaction:', error);
    }
  }
}