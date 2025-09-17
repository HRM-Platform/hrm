import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtGlobalModule } from 'src/jwt/jwt.module';
//import { GoogleStrategy } from './strategies/google-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule, JwtGlobalModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    //GoogleStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
