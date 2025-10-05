import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { globalValidationPipe } from '../../config/pipes.config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { AllExceptionsFilter } from '../filters/http-exception.filter';
import { ExistsConstraint } from '../validators/exists.constraint';
import { DataSource } from 'typeorm';

export const appProviders = [
  {
    provide: APP_PIPE,
    useValue: globalValidationPipe,
  },
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
  ExistsConstraint,
];
