import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function setupSecurity(app: INestApplication) {
  app.use(helmet());
  app.enableCors({
    origin: '*', // or specific origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
}
