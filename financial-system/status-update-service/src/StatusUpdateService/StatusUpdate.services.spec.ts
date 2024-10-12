import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import { StatusUpdateService } from './StatusUpdateService.service';
import { Transaction } from './Transaction.entity';

describe('StatusUpdateService', () => {
  let service: StatusUpdateService;
  let mockKafkaClient: any;
  let mockTransactionRepository: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockKafkaClient = {
      subscribeToResponseOf: jest.fn(),
      connect: jest.fn(),
    };

    mockTransactionRepository = {
      update: jest.fn(),
    };

    mockCacheManager = {
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusUpdateService,
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<StatusUpdateService>(StatusUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to Kafka successfully', async () => {
      jest.spyOn(service as any, 'connectWithRetry').mockResolvedValue(undefined);
      await service.onModuleInit();
      expect((service as any).connectWithRetry).toHaveBeenCalledWith(['transaction_status_updated']);
    });

    it('should throw error if connection fails', async () => {
      jest.spyOn(service as any, 'connectWithRetry').mockRejectedValue(new Error('Connection failed'));
      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('handleStatusUpdate', () => {
    it('should update transaction status and clear cache', async () => {
      const data = { transactionExternalId: '123', status: 'approved' };
      await service.handleStatusUpdate(data);

      expect(mockTransactionRepository.update).toHaveBeenCalledWith(
        { externalId: '123' },
        { status: 'approved' }
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith('transaction:123');
    });

    it('should log error for invalid message', async () => {
      const loggerSpy = jest.spyOn(Logger, 'error');
      await service.handleStatusUpdate({});
      expect(loggerSpy).toHaveBeenCalledWith('Invalid message received');
    });

    it('should log error for invalid status', async () => {
      const loggerSpy = jest.spyOn(Logger, 'error');
      await service.handleStatusUpdate({ transactionExternalId: '123', status: 'invalid' });
      expect(loggerSpy).toHaveBeenCalledWith('Invalid status received');
    });
  });
});