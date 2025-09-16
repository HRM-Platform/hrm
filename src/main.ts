import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import { globalValidationPipe } from './config/pipes.config';
import { setupVersioning } from './config/versioning.config';
import { setupSecurity } from './config/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // --- Security ---
  setupSecurity(app);

  // --- API Versioning ---
  setupVersioning(app);

  // --- Global Pipes ---
  app.useGlobalPipes(globalValidationPipe);

  // --- API Documentation (Swagger) ---
  setupSwagger(app);

  // --- Graceful Shutdown ---
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log('Application successfully started 🎉');
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 API documentation at: http://localhost:${port}/docs`);
}

void bootstrap();
