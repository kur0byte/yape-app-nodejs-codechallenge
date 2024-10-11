import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProxyService } from './proxy/proxy.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const proxyService = app.get(ProxyService);

  app.use('/api/transactions', proxyService.getProxy('/api/transactions'));
  app.use('/api/anti-fraud', proxyService.getProxy('/api/anti-fraud'));
  app.use('/api/status', proxyService.getProxy('/api/status'));
  await app.listen(3000);
}
bootstrap();
