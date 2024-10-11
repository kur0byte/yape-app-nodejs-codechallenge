import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusUpdateController } from './StatusUpdate.controller';
import { StatusUpdateService } from './StatusUpdateService.service';
import { Transaction } from './Transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CacheModule} from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
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
    CacheModule.register([
      {
        store: redisStore,
        host: 'localhost',
        port: 6379,
        ttl: 500,
      }
    ])
  ],
  controllers: [StatusUpdateController],
  providers: [StatusUpdateService],
})
export class StatusUpdateModule {}