import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { APP_PIPE } from '@nestjs/core';
import { globalValidationPipe } from './config/pipes.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
      load: [databaseConfig],
    }),
    AuthModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: globalValidationPipe,
    },
  ],
})
export class AppModule {}
