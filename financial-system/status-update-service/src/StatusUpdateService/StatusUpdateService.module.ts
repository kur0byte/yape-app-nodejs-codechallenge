import { Module } from '@nestjs/common';
import { ClientsModule, KafkaOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusUpdateController } from './StatusUpdate.controller';
import { StatusUpdateService } from './StatusUpdateService.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): KafkaOptions => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'status-update-service',
              brokers: [configService.get<string>('KAFKA_BROKER')],
              retry: {
                initialRetryTime: 300,
                retries: 12
              },
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
          },
        }),
        inject: [ConfigService],
      },
    ])
  ],
  controllers: [StatusUpdateController],
  providers: [StatusUpdateService],
})
export class StatusUpdateModule {}