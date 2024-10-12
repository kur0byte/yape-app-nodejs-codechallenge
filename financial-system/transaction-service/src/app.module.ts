import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./Transaction/Transaction.entity"; // Adjust the import path as needed
import { TransactionModule } from "./Transaction/Transaction.module";

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
        replication: {
          master: {
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
          },
          slaves: [{
            host: configService.get<string>('DB_REPLICA_HOST'),
            port: configService.get<number>('DB_REPLICA_PORT') || configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
          }],
        },
        entities: [Transaction],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        extra: {
          max: 100,
          idleTimeoutMillis: 30000, 
        },
      }),
      inject: [ConfigService],
    }),
    TransactionModule,
  ],
  exports: [ConfigModule, TypeOrmModule],
})
export class AppModule {}