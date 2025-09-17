import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './config/app/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await setupApp(app);
}

void bootstrap();
