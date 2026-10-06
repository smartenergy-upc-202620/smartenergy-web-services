/**
 * HTTP port of a service: `PORT` (set by cloud providers such as Railway)
 * wins, then the service-specific variable, then the local default.
 */
export function resolvePort(
  serviceEnvKey: string,
  defaultPort: number,
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = env.PORT || env[serviceEnvKey];
  if (!raw) return defaultPort;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port "${raw}"`);
  }
  return port;
}
