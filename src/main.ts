import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './config/app/app.config';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await setupApp(app);
}

void bootstrap();
