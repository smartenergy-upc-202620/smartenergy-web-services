import { INestApplication, ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configureHttpApp, ErrorStatusMap } from '@app/common';
import { AddressInfo } from 'net';
import { DataSource } from 'typeorm';

export interface TestResponse {
  status: number;
  body: any;
}

export interface HttpTestApp {
  app: INestApplication;
  baseUrl: string;
  request(
    method: string,
    path: string,
    options?: { body?: unknown; headers?: Record<string, string> },
  ): Promise<TestResponse>;
  close(): Promise<void>;
}

/**
 * Starts a real HTTP server (random port) with the same conventions as
 * production: `/api/v1` prefix, ValidationPipe and ApiExceptionFilter.
 */
export async function startHttpTestApp(
  metadata: ModuleMetadata,
  errorStatuses: ErrorStatusMap = [],
): Promise<HttpTestApp> {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureHttpApp(app, errorStatuses);
  await app.listen(0, '127.0.0.1');
  const { port } = app.getHttpServer().address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    app,
    baseUrl,
    async request(method, path, options = {}) {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'content-type': 'application/json', ...options.headers },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      const text = await res.text();
      return { status: res.status, body: text ? JSON.parse(text) : undefined };
    },
    close: () => app.close(),
  };
}

/**
 * Stand-in for the TypeORM DataSource so modules that import TypeOrmModule
 * can be compiled without a running PostgreSQL.
 */
export const fakeDataSource = {
  options: { type: 'postgres' },
  entityMetadatas: [],
  manager: {},
  getRepository: () => ({}),
  destroy: () => Promise.resolve(),
} as unknown as DataSource;
