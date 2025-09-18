import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { setupSecurity } from './security.config';
import { setupVersioning } from './versioning.config';
import { setupSwagger } from './swagger.config';
import { Reflector } from '@nestjs/core';

export function setupApp(app: INestApplication) {
  setupSecurity(app);
  setupVersioning(app);
  setupSwagger(app);

  app.enableShutdownHooks();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  return app;
}
