import { registerAs } from '@nestjs/config';

/**
 * Base URLs of the downstream services the gateway routes to.
 */
export const gatewayConfig = registerAs('gateway', () => ({
  userServiceUrl: process.env.USER_SERVICE_URL ?? 'http://localhost:3001',
  energyMonitoringServiceUrl:
    process.env.ENERGY_SERVICE_URL ?? 'http://localhost:3002',
  alertServiceUrl: process.env.ALERT_SERVICE_URL ?? 'http://localhost:3003',
}));
