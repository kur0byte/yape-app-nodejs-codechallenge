import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StatusUpdateService } from './StatusUpdateService.service';

@Controller()
export class StatusUpdateController {
  constructor(private readonly statusUpdateService: StatusUpdateService) {}

  @EventPattern('transaction_status_updated')
  async handleTransactionCreated(@Payload() message: any) {
    await this.statusUpdateService.handleStatusUpdate(message);
  }
}