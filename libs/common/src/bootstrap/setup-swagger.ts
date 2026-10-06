import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_VERSION, SWAGGER_PATH } from './api.constants';

export interface SwaggerOptions {
  title: string;
  description: string;
  bearerAuth?: boolean;
}

export function setupSwagger(
  app: INestApplication,
  options: SwaggerOptions,
): void {
  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(API_VERSION);
  if (options.bearerAuth) builder.addBearerAuth();

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
