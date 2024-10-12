import { Test, TestingModule } from '@nestjs/testing';
import { AntiFraudService } from './Antifraud.service';
import { ClientKafka } from '@nestjs/microservices';

jest.mock('@nestjs/microservices', () => ({
  ClientKafka: jest.fn().mockImplementation(() => ({
    subscribeToResponseOf: jest.fn().mockResolvedValue(undefined),
    connect: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
  })),
}));

describe('AntiFraudService', () => {
  let service: AntiFraudService;
  let kafkaClient: ClientKafka;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AntiFraudService,
        {
          provide: 'KAFKA_SERVICE',
          useFactory: () => new ClientKafka({}),
        },
      ],
    }).compile();

    service = module.get<AntiFraudService>(AntiFraudService);
    kafkaClient = module.get<ClientKafka>('KAFKA_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to Kafka successfully', async () => {
      jest.spyOn(service as any, 'connectWithRetry').mockResolvedValue(undefined);
      await service.onModuleInit();
      expect((service as any).connectWithRetry).toHaveBeenCalledWith(['transaction_created']);
    });

    it('should retry connection on failure', async () => {
      const connectWithRetrySpy = jest.spyOn(service as any, 'connectWithRetry')
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      expect(connectWithRetrySpy).toHaveBeenCalledTimes(1);

      // Call onModuleInit again to trigger the retry
      await service.onModuleInit();

      // Verify that connectWithRetry was called twice in total
      expect(connectWithRetrySpy).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      jest.spyOn(service as any, 'connectWithRetry').mockRejectedValue(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('processTransaction', () => {
    it('should approve transaction when value is at the threshold', async () => {
      const transaction = { externalId: '123', value: 1000 };
      await service.processTransaction(transaction);

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'transaction_status_updated',
        JSON.stringify({
          transactionExternalId: '123',
          status: 'approved',
        })
      );
    });

    it('should approve transaction when value is below the threshold', async () => {
      const transaction = { externalId: '456', value: 999.99 };
      await service.processTransaction(transaction);

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'transaction_status_updated',
        JSON.stringify({
          transactionExternalId: '456',
          status: 'approved',
        })
      );
    });

    it('should reject transaction when value is above the threshold', async () => {
      const transaction = { externalId: '789', value: 1000.01 };
      await service.processTransaction(transaction);

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'transaction_status_updated',
        JSON.stringify({
          transactionExternalId: '789',
          status: 'rejected',
        })
      );
    });

    it('should reject transaction when value is significantly above the threshold', async () => {
      const transaction = { externalId: '101', value: 5000 };
      await service.processTransaction(transaction);

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'transaction_status_updated',
        JSON.stringify({
          transactionExternalId: '101',
          status: 'rejected',
        })
      );
    });
  });
});