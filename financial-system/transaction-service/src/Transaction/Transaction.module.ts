import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionController } from './Transaction.controller';
import { TransactionService } from './Transaction.service';
import { Transaction } from './Transaction.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
    CacheModule.register<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = '127.0.0.1';
        const redisPort = configService.get<number>('REDIS_PORT');
        Logger.log(`Connecting to Redis at ${redisHost}:${redisPort}`);
        return {
          url: `redis://${redisHost}:${redisPort}`,
          store: redisStore,
          ttl: 300,
          global: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}