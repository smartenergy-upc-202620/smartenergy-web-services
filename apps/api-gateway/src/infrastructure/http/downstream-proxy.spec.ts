import { ServiceUnavailableException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { DownstreamProxy } from './downstream-proxy';

describe('DownstreamProxy', () => {
  const proxy = new DownstreamProxy({
    userServiceUrl: 'http://user:3001',
    energyMonitoringServiceUrl: 'http://energy:3002',
    alertServiceUrl: 'http://alert:3003',
  });
  const request = {
    method: 'GET',
    originalUrl: '/api/v1/alerts',
    headers: {},
  } as Request;
  const response = { status: jest.fn() } as unknown as Response;
  const fetchMock = jest.spyOn(global, 'fetch');

  afterAll(() => fetchMock.mockRestore());

  it('answers 503 when the downstream service is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(
      proxy.forward('alert-service', request, response),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('returns non JSON bodies as text and empty bodies as undefined', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('plain', { headers: { 'content-type': 'text/plain' } }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(
      proxy.forward('alert-service', request, response),
    ).resolves.toBe('plain');
    await expect(
      proxy.forward('alert-service', request, response),
    ).resolves.toBeUndefined();
    expect(response.status).toHaveBeenLastCalledWith(204);
  });

  it('reports a service as down when its health check fails', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(new Response('{}', { status: 500 }));

    await expect(proxy.checkHealth()).resolves.toEqual([
      { service: 'user-service', status: 'up' },
      { service: 'energy-monitoring-service', status: 'down' },
      { service: 'alert-service', status: 'down' },
    ]);
  });
});
