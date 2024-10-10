import { Module } from '@nestjs/common';
import { ClientsModule, KafkaOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AntiFraudController } from './Antifraud.controller';
import { AntiFraudService } from './Antifraud.service';

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
              clientId: 'antifraud-service',
              brokers: [configService.get<string>('KAFKA_BROKER')],
              retry: {
                initialRetryTime: 300,
                retries: 12
              },
            },
            consumer: {
              groupId: 'antifraud',
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
  controllers: [AntiFraudController],
  providers: [AntiFraudService],
})
export class AntiFraudModule {}