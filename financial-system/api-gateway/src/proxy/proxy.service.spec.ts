import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { createProxyMiddleware } from 'http-proxy-middleware';

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks before each test
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyService],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create proxies for all services', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: 'http://transaction-service:3001/transactions',
      changeOrigin: true,
      pathRewrite: { '^/api/transactions': '/' },
    });
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: 'http://anti-fraud-service:3002/anti-fraud',
      changeOrigin: true,
      pathRewrite: { '^/api/anti-fraud': '/' },
    });
    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: 'http://status-update-service:3003/status',
      changeOrigin: true,
      pathRewrite: { '^/api/status': '/' },
    });
  });

  it('should return the correct proxy for a given path', () => {
    const transactionProxy = service.getProxy('/api/transactions');
    const antiFraudProxy = service.getProxy('/api/anti-fraud');
    const statusProxy = service.getProxy('/api/status');

    expect(transactionProxy).toBeDefined();
    expect(antiFraudProxy).toBeDefined();
    expect(statusProxy).toBeDefined();
    expect(service.getProxy('/non-existent-path')).toBeUndefined();
  });
});