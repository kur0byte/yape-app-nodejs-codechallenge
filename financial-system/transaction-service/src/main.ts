import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Financial System')
    .setDescription('Yape Challenge Financial System Transactions API')
    .setVersion('1.0')
    .addTag('transactions')
    .addServer('http://localhost:3000/api', 'Local')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('transactions/docs', app, document);
  await app.listen(3001);
}
bootstrap();
