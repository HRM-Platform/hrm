import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './config/app/app.config';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  let app = await NestFactory.create(AppModule);

  app = setupApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  return await app.getUrl();
}

void (async (): Promise<void> => {
  try {
    const url = await bootstrap();
    Logger.log('================================================', 'Bootstrap');
    Logger.log('Application successfully started 🎉', 'Bootstrap');
    Logger.log(url, 'Bootstrap');
  } catch (error) {
    Logger.error(error, 'Bootstrap');
  }
})();
