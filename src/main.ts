import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // --- Security ---
  app.use(helmet()); // Apply basic security headers
  app.enableCors({
    origin: '*', // Or specify allowed origins: 'http://localhost:3001'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- API Versioning ---
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // --- Global Pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties that do not have any decorators
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true, // Convert query parameters to their expected types
      },
    }),
  );

  // --- API Documentation (Swagger) ---
  const config = new DocumentBuilder()
    .setTitle('My API Documentation')
    .setDescription('The official API documentation for HRM.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // --- Graceful Shutdown ---
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log('Application successfully started 🎉');
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(
    `📚 API documentation is available at: http://localhost:${port}/docs`,
  );
}

void bootstrap();
