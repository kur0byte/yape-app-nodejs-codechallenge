import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AntiFraudService } from './Antifraud.service';

@Controller()
export class AntiFraudController {
  constructor(private readonly antiFraudService: AntiFraudService) {}

  @MessagePattern('transaction_created')
  async handleTransactionCreated(@Payload() message: any) {
    const transaction = JSON.parse(message.value);
    await this.antiFraudService.processTransaction(transaction);
  }
}