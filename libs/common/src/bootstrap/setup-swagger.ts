import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_VERSION, SWAGGER_PATH } from './api.constants';

export interface SwaggerOptions {
  title: string;
  description: string;
}

export function setupSwagger(
  app: INestApplication,
  options: SwaggerOptions,
): void {
  const config = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(API_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
