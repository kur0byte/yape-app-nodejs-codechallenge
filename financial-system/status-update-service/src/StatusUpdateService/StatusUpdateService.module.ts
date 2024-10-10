import { ClientsModule, KafkaOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusUpdateController } from './StatusUpdate.controller';
import { StatusUpdateService } from './StatusUpdateService.service';
import { Transaction } from './Transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Transaction],
        // synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [StatusUpdateController],
  providers: [StatusUpdateService],
})
export class StatusUpdateModule {}