import { INestApplication, Logger, Type, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ApiExceptionFilter,
  ErrorStatusMap,
} from '../http/api-exception.filter';
import { API_GLOBAL_PREFIX, SWAGGER_PATH } from './api.constants';
import { resolvePort } from './resolve-port';
import { setupSwagger } from './setup-swagger';

export interface BootstrapServiceOptions {
  module: Type<unknown>;
  serviceName: string;
  title: string;
  description: string;
  /**
   * Service-specific port variable, used when `PORT` (set by cloud
   * providers) is absent.
   */
  portEnvKey: string;
  /** Local default port. */
  defaultPort: number;
  /** Errors of the inner layers translated to HTTP status codes. */
  errorStatuses?: ErrorStatusMap;
  /** Documents the `Authorization: Bearer <token>` scheme in Swagger. */
  bearerAuth?: boolean;
}

/**
 * HTTP conventions shared by every application (also used by HTTP tests):
 * global prefix, validation and consistent error responses.
 */
export function configureHttpApp(
  app: INestApplication,
  errorStatuses: ErrorStatusMap = [],
): void {
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter(errorStatuses));
}

/**
 * Shared bootstrap for every service: HTTP conventions and Swagger.
 */
export async function bootstrapService(
  options: BootstrapServiceOptions,
): Promise<void> {
  const logger = new Logger(options.serviceName);

  try {
    const app = await NestFactory.create(options.module);

    configureHttpApp(app, options.errorStatuses);
    app.enableShutdownHooks();
    setupSwagger(app, {
      title: options.title,
      description: options.description,
      bearerAuth: options.bearerAuth,
    });

    const port = resolvePort(options.portEnvKey, options.defaultPort);
    await app.listen(port);

    logger.log(
      `Listening on port ${port}: /${API_GLOBAL_PREFIX}, /${SWAGGER_PATH}`,
    );
  } catch (error) {
    logger.error('Failed to start service', error);
    process.exit(1);
  }
}
