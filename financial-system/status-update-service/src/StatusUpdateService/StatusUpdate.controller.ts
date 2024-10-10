import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StatusUpdateService } from './StatusUpdateService.service';

@Controller()
export class StatusUpdateController {
  constructor(private readonly statusUpdateService: StatusUpdateService) {}

  @EventPattern('transaction_status_updated')
  async handleTransactionCreated(@Payload() message: any) {
    console.log('Received transaction status update:', message);
    // await this.statusUpdateService.processTransaction(message);
    // console.log('Transaction processed');
  }
}