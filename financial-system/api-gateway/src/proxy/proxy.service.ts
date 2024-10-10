import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class ProxyService {
  private readonly proxies: Record<string, ReturnType<typeof createProxyMiddleware>> = {};

  constructor() {
    this.setupProxies();
  }

  private setupProxies() {
    const services = [
      // { path: '/api/transactions', target: 'http://localhost:3001/transactions' },
      // { path: '/api/anti-fraud', target: 'http://localhost:3002/anti-fraud' },
      // { path: '/api/status', target: 'http://localhost:3003/status' },
      { path: '/api/transactions', target: 'http://transaction-service:3001/transactions' },
      { path: '/api/anti-fraud', target: 'http://anti-fraud-service:3002/anti-fraud' },
      { path: '/api/status', target: 'http://status-update-service:3003/status' },
    ];

    services.forEach(({ path, target }) => {
      this.proxies[path] = createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^${path}`]: '/' },
      });
      console.log(`Proxy created for path: ${path} -> ${target}`);
    });
  }

  public getProxy(path: string) {
    return this.proxies[path];
  }

  async forward(req: Request, res: Response) {
    console.log(`Received request for path: ${req.path}`);
    const path = Object.keys(this.proxies).find(p => req.path.startsWith(p));
    if (path) {
      console.log(`Forwarding request to proxy for path: ${path}`);
      this.proxies[path](req, res, (err) => {
        if (err) {
          console.error(`Error forwarding request: ${err.message}`);
          res.status(500).send('Internal Server Error');
        }
      });
    } else {
      console.log(`No proxy found for path: ${req.path}`);
      res.status(404).send('Not Found');
    }
  }
}