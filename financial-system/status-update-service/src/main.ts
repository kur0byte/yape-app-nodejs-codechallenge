import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { StatusUpdateModule } from './StatusUpdateService/StatusUpdateService.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StatusUpdateModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER],
        },
        consumer: {
          groupId: 'status-update',
        },
      },
    }
  );

  const configService = app.get(ConfigService);
  console.log(`Connecting to Kafka broker: ${configService.get('KAFKA_BROKER')}`);

  await app.listen();
  console.log('Status Update microservice is listening');
}
bootstrap();