import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { TransactionService } from './Transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './Transaction.entity';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionDto } from './dto/transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiOkResponse({ description: 'The transaction has been successfully created.', type: TransactionDto })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return await this.transactionService.create(createTransactionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully retrieved.', type: TransactionDto })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return await this.transactionService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions have been successfully retrieved.' })
  find() {
    Logger.log('Hello from transaction service');
    return "Hello from transaction service";
  }
}