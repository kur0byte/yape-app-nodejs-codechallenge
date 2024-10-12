import { Test, TestingModule } from '@nestjs/testing';
import { AntiFraudController } from './Antifraud.controller';
import { AntiFraudService } from './Antifraud.service';

describe('AntiFraudController', () => {
  let controller: AntiFraudController;
  let service: AntiFraudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AntiFraudController],
      providers: [
        {
          provide: AntiFraudService,
          useValue: {
            processTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AntiFraudController>(AntiFraudController);
    service = module.get<AntiFraudService>(AntiFraudService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleTransactionCreated', () => {
    it('should process transaction successfully', async () => {
      const message = { id: '123', amount: 100 };
      const consoleSpy = jest.spyOn(console, 'log');
      
      await controller.handleTransactionCreated(message);

      expect(service.processTransaction).toHaveBeenCalledWith(message);
      expect(consoleSpy).toHaveBeenCalledWith('Received transaction:', message);
      expect(consoleSpy).toHaveBeenCalledWith('Transaction processed');
    });

    it('should handle errors when processing transaction', async () => {
      const message = { id: '123', amount: 100 };
      const error = new Error('Processing failed');
      (service.processTransaction as jest.Mock).mockRejectedValue(error);
      
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const consoleLogSpy = jest.spyOn(console, 'log');

      await controller.handleTransactionCreated(message);

      expect(service.processTransaction).toHaveBeenCalledWith(message);
      expect(consoleLogSpy).toHaveBeenCalledWith('Received transaction:', message);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to process transaction:', error);
    });
  });
});