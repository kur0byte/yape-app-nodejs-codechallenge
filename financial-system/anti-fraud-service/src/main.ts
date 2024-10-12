import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AntiFraudModule } from './AntifraudSystem/AntifraudSystem.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AntiFraudModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER],
        },
        consumer: {
          groupId: 'antifraud',
        },
      },
    }
  );

  const configService = app.get(ConfigService);
  Logger.log(`Connecting to Kafka broker: ${configService.get('KAFKA_BROKER')}`);

  await app.listen();
  Logger.log('Anti-Fraud microservice is listening');
}
bootstrap();