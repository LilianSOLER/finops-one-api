import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { config } from './docs';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function to initialize the NestJS application.
 * Sets up Swagger documentation, global validation pipe, and starts the server.
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Create Swagger documentation
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // This will remove any properties that are not in the DTO
    }),
  );
  await app.listen(3333);
}
bootstrap();
