import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TransactionService } from './transaction.service';
import { Transaction } from './Transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: any;
  let mockKafkaClient: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    };
    mockKafkaClient = {
      emit: jest.fn(),
    };
    mockCacheManager = {
      set: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const dto: CreateTransactionDto = {
        accountExternalIdDebit: uuidv4(),
        accountExternalIdCredit: uuidv4(),
        tranferTypeId: 1,
        value: 100
      };
      const mockUuid = 'mock-uuid';
      (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

      const expectedTransaction = {
        ...dto,
        externalId: mockUuid,
        status: 'pending',
      };

      mockRepository.create.mockReturnValue(expectedTransaction);
      mockRepository.save.mockResolvedValue(expectedTransaction);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(expectedTransaction);
      expect(mockCacheManager.set).toHaveBeenCalledWith(`transaction:${mockUuid}`, expectedTransaction);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedTransaction);
      expect(mockKafkaClient.emit).toHaveBeenCalledWith('transaction_created', JSON.stringify(expectedTransaction));
      expect(result).toEqual(expectedTransaction);
    });

    it('should throw an error if accountExternalIdDebit is not a valid UUID', async () => {
      const dto: CreateTransactionDto = {
        accountExternalIdDebit: 'invalid-uuid',
        accountExternalIdCredit: uuidv4(),
        tranferTypeId: 1,
        value: 100
      };

      await expect(service.create(dto)).rejects.toThrow();
    });

    it('should throw an error if value is not positive', async () => {
      const dto: CreateTransactionDto = {
        accountExternalIdDebit: uuidv4(),
        accountExternalIdCredit: uuidv4(),
        tranferTypeId: 1,
        value: -100
      };

      await expect(service.create(dto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a transaction from cache if it exists', async () => {
      const mockTransaction = { 
        id: 1, 
        externalId: 'cached-id', 
        accountExternalIdDebit: uuidv4(),
        accountExternalIdCredit: uuidv4(),
        tranferTypeId: 1,
        value: 100,
        status: 'pending'
      };
      mockCacheManager.get.mockResolvedValue(mockTransaction);

      const result = await service.findOne('cached-id');

      expect(mockCacheManager.get).toHaveBeenCalledWith('transaction:cached-id');
      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch a transaction from the repository if not in cache', async () => {
      const mockTransaction = { 
        id: 1, 
        externalId: 'db-id', 
        accountExternalIdDebit: uuidv4(),
        accountExternalIdCredit: uuidv4(),
        tranferTypeId: 1,
        value: 100,
        status: 'pending'
      };
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne('db-id');

      expect(mockCacheManager.get).toHaveBeenCalledWith('transaction:db-id');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { externalId: 'db-id' } });
      expect(result).toEqual(mockTransaction);
    });

    it('should return null if transaction is not found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });
});