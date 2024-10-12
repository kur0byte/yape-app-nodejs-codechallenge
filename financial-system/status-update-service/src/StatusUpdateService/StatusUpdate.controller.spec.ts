import { Test, TestingModule } from '@nestjs/testing';
import { StatusUpdateController } from './StatusUpdate.controller';
import { StatusUpdateService } from './StatusUpdateService.service';

describe('StatusUpdateController', () => {
  let controller: StatusUpdateController;
  let service: StatusUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusUpdateController],
      providers: [
        {
          provide: StatusUpdateService,
          useValue: {
            handleStatusUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatusUpdateController>(StatusUpdateController);
    service = module.get<StatusUpdateService>(StatusUpdateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleTransactionCreated', () => {
    it('should call statusUpdateService.handleStatusUpdate with the correct payload', async () => {
      const message = { transactionExternalId: '123', status: 'approved' };
      await controller.handleTransactionCreated(message);
      expect(service.handleStatusUpdate).toHaveBeenCalledWith(message);
    });
  });
});