import { registerAs } from '@nestjs/config';

/**
 * Downstream URL from the environment. The localhost default only applies
 * outside production: a deployed gateway must be told where services live.
 */
function serviceUrl(envKey: string, localDefault: string): string {
  const value = process.env[envKey];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${envKey} must be set in production`);
  }
  return localDefault;
}

/**
 * Base URLs of the downstream services the gateway routes to.
 */
export const gatewayConfig = registerAs('gateway', () => ({
  userServiceUrl: serviceUrl('USER_SERVICE_URL', 'http://localhost:3001'),
  energyMonitoringServiceUrl: serviceUrl(
    'ENERGY_SERVICE_URL',
    'http://localhost:3002',
  ),
  alertServiceUrl: serviceUrl('ALERT_SERVICE_URL', 'http://localhost:3003'),
}));
