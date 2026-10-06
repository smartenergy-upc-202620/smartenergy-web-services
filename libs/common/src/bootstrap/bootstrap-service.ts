import { INestApplication, Logger, Type, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  ApiExceptionFilter,
  ErrorStatusMap,
} from '../http/api-exception.filter';
import { API_GLOBAL_PREFIX, SWAGGER_PATH } from './api.constants';
import { setupSwagger } from './setup-swagger';

export interface BootstrapServiceOptions {
  module: Type<unknown>;
  serviceName: string;
  title: string;
  description: string;
  /** Environment variable that holds the HTTP port of the service. */
  portEnvKey: string;
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

    const port = Number(
      app.get(ConfigService).get(options.portEnvKey, options.defaultPort),
    );
    await app.listen(port);

    logger.log(`Listening on http://localhost:${port}/${API_GLOBAL_PREFIX}`);
    logger.log(
      `Swagger UI available at http://localhost:${port}/${SWAGGER_PATH}`,
    );
  } catch (error) {
    logger.error('Failed to start service', error);
    process.exit(1);
  }
}
