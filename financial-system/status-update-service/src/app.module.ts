import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatusUpdateModule } from './StatusUpdateService/StatusUpdateService.module';
import { Transaction } from './StatusUpdateService/Transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StatusUpdateModule,
  ],
  exports: [],
})
export class AppModule {}