import { Module } from '@nestjs/common';
import { ClientsModule, KafkaOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AntiFraudController } from './Antifraud.controller';
import { AntiFraudService } from './Antifraud.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): KafkaOptions => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'anti-fraud',
              brokers: [configService.get<string>('KAFKA_BROKER')],
              retry: {
                initialRetryTime: 100,
                retries: 8
              },
            },
            consumer: {
              groupId: 'anti-fraud-consumer',
            },
            producer: {
              retry: {
                initialRetryTime: 100,
                retries: 8
              }
            }
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AntiFraudController],
  providers: [AntiFraudService],
})
export class AntiFraudModule {}