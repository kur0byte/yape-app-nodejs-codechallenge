import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ProxyService } from './proxy/proxy.service';
import { AllExceptionsFilter } from './filter/all-exceptions-filter';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    ProxyService
  ],
})
export class AppModule {}