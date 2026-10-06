import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { API_GLOBAL_PREFIX } from '@app/common';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { gatewayConfig } from '../configuration/gateway.config';

export type DownstreamService =
  'user-service' | 'energy-monitoring-service' | 'alert-service';

export interface ServiceHealth {
  service: DownstreamService;
  status: 'up' | 'down';
}

const REQUEST_TIMEOUT_MS = 10_000;
const HEALTH_TIMEOUT_MS = 3_000;
const METHODS_WITHOUT_BODY = ['GET', 'HEAD'];

/**
 * Forwards HTTP requests to the downstream services unchanged: same method,
 * path, query string, JSON body and Authorization header. The downstream
 * status code and body are returned as they are.
 */
@Injectable()
export class DownstreamProxy {
  private readonly baseUrls: Record<DownstreamService, string>;

  constructor(
    @Inject(gatewayConfig.KEY) config: ConfigType<typeof gatewayConfig>,
  ) {
    this.baseUrls = {
      'user-service': config.userServiceUrl,
      'energy-monitoring-service': config.energyMonitoringServiceUrl,
      'alert-service': config.alertServiceUrl,
    };
  }

  async forward(
    service: DownstreamService,
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<unknown> {
    const hasBody = !METHODS_WITHOUT_BODY.includes(request.method);
    const headers: Record<string, string> = { accept: 'application/json' };
    if (request.headers.authorization) {
      headers.authorization = request.headers.authorization;
    }
    if (hasBody) headers['content-type'] = 'application/json';

    let upstream: Response;
    try {
      upstream = await fetch(
        new URL(request.originalUrl, this.baseUrls[service]),
        {
          method: request.method,
          headers,
          body: hasBody ? JSON.stringify(request.body ?? {}) : undefined,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );
    } catch {
      throw new ServiceUnavailableException(`${service} is unavailable`);
    }

    response.status(upstream.status);
    const text = await upstream.text();
    if (!text) return undefined;
    return upstream.headers.get('content-type')?.includes('application/json')
      ? (JSON.parse(text) as unknown)
      : text;
  }

  checkHealth(): Promise<ServiceHealth[]> {
    return Promise.all(
      (Object.keys(this.baseUrls) as DownstreamService[]).map(
        async (service) => {
          try {
            const res = await fetch(
              `${this.baseUrls[service]}/${API_GLOBAL_PREFIX}/health`,
              { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) },
            );
            return { service, status: res.ok ? 'up' : 'down' } as const;
          } catch {
            return { service, status: 'down' } as const;
          }
        },
      ),
    );
  }
}
