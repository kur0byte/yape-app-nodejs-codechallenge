import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StatusUpdateModule } from './StatusUpdateService/StatusUpdateService.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    StatusUpdateModule,
  ],
})
export class AppModule {}