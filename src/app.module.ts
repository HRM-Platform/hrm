import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database/database.config';
import jwtConfig from './config/jwt/jwt.config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { JwtGlobalModule } from './jwt/jwt.module';
import { appProviders } from './common/providers/app.providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
      load: [databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    JwtGlobalModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [...appProviders],
})
export class AppModule {}
