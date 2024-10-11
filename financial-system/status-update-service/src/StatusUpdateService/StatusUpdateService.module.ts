import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusUpdateController } from './StatusUpdate.controller';
import { StatusUpdateService } from './StatusUpdateService.service';
import { Transaction } from './Transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

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
              clientId: 'status-update-service',
              brokers: [configService.get<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'status-update',
              allowAutoTopicCreation: true,
            },
            producer: {
              retry: {
                initialRetryTime: 300,
                retries: 12
              }
            }
          }
        }),
        inject: [ConfigService],
      },
    ]),
    CacheModule.register<CacheModuleOptions>({
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
  controllers: [StatusUpdateController],
  providers: [StatusUpdateService],
})
export class StatusUpdateModule {}