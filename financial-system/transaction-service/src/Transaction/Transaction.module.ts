import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionController } from './Transaction.controller';
import { TransactionService } from './Transaction.service';
import { Transaction } from './Transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'transaction-client',
              brokers: [configService.get<string>('KAFKA_BROKER')],
            },
            producer: {
              allowAutoTopicCreation: true,
            },
            consumer: {
              groupId: 'transaction',
            },
          }
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}