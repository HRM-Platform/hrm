import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSecurity } from '../security.config';
import { setupVersioning } from '../versioning.config';
import { setupSwagger } from '../swagger/swagger.config';

export async function setupApp(app: INestApplication) {
  const logger = new Logger('AppSetup');
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;

  setupSecurity(app);
  setupVersioning(app);
  setupSwagger(app);

  app.enableShutdownHooks();

  await app.listen(port);

  // Logs
  logger.log('Application successfully started 🎉');
  logger.log(`🚀 Running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Docs at: http://localhost:${port}/docs`);
}
