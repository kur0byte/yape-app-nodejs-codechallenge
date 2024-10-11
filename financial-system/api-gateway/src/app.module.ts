import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ProxyModule } from './proxy/proxy.module';
import { AllExceptionsFilter } from './filter/all-exceptions-filter';
import { ProxyService } from './proxy/proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ProxyModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // ProxyService
  ],
})
export class AppModule {}