import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './Transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './Transaction.entity';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174001',
        tranferTypeId: 1,
        value: 100.00,
      };
      const expectedResult: Transaction = {
        id: 1,
        externalId: '123e4567-e89b-12d3-a456-426614174002',
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174000',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174001',
        tranferTypeId: 1,
        value: 100.00,
        status: 'pending',
        createdAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createTransactionDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createTransactionDto);
    });
  });

  describe('findOne', () => {
    it('should return a transaction', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResult: Transaction = {
        id: 1,
        externalId: id,
        accountExternalIdDebit: '123e4567-e89b-12d3-a456-426614174001',
        accountExternalIdCredit: '123e4567-e89b-12d3-a456-426614174002',
        tranferTypeId: 1,
        value: 2090,
        status: 'rejected',
        createdAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne(id)).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('find', () => {
    it('should return a greeting message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const result = controller.find();

      expect(consoleSpy).toHaveBeenCalledWith('Hello from transaction service');
      expect(result).toBe('Hello from transaction service');
    });
  });
});