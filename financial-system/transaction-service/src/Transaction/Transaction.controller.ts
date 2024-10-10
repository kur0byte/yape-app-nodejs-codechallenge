import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TransactionService } from './Transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Get()
  find() {
    console.log('Hello from transaction service');
    return "Hello fronm transaction service";
  }
}