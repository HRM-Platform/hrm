import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt/jwt.config';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (jwt: ConfigType<typeof jwtConfig>) => {
        return {
          secret: jwt.secret,
          signOptions: {
            expiresIn: jwt.expiresIn,
          },
        };
      },
    }),
  ],
  exports: [JwtModule],
})
export class JwtGlobalModule {}
