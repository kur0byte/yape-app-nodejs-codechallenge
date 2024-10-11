import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AntiFraudModule } from './AntifraudSystem/AntifraudSystem.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AntiFraudModule,
  ],
})
export class AppModule {}