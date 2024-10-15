import { Module, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Transaction } from "./Transaction/Transaction.entity";
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
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Transaction],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        logging: true,
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    TransactionModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource
  ) {}

  async onModuleInit() {
    this.logger.log(`DB_SYNCHRONIZE: ${this.configService.get<boolean>('DB_SYNCHRONIZE')}`);
    this.logger.log(`DataSource isInitialized: ${this.dataSource.isInitialized}`);

    if (this.configService.get<boolean>('DB_SYNCHRONIZE')) {
      try {
        if (!this.dataSource.isInitialized) {
          await this.dataSource.initialize();
        }
        await this.dataSource.synchronize();
        this.logger.log('Database schema synchronized');
      } catch (error) {
        this.logger.error('Failed to synchronize database schema', error);
      }
    }
  }
}