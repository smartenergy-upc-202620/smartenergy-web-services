import { Logger, Type, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
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
}

/**
 * Shared bootstrap for every service: global prefix, validation and Swagger.
 */
export async function bootstrapService(
  options: BootstrapServiceOptions,
): Promise<void> {
  const logger = new Logger(options.serviceName);

  try {
    const app = await NestFactory.create(options.module);

    app.setGlobalPrefix(API_GLOBAL_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    setupSwagger(app, {
      title: options.title,
      description: options.description,
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
