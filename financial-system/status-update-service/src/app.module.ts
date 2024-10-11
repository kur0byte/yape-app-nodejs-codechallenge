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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Transaction],
        // synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    }),
    StatusUpdateModule,
  ],
  exports: [ConfigModule, TypeOrmModule],
})
export class AppModule {}