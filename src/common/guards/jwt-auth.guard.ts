// shared/src/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflactor: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflactor.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const type = context.getType();
    let token: string;
    if (type === 'rpc') {
      const data = context.switchToRpc().getData();
      token = data?.token;
    } else {
      const req = context.switchToHttp().getRequest();
      token = req.headers['authorization']?.split(' ')[1];
    }

    if (!token) throw new UnauthorizedException('Invalid or expired token');

    try {
      const payload = this.jwtService.verify(token, {
        secret: 'altafkorejo',
      });

      if (type === 'rpc') context.switchToRpc().getData().user = payload;
      else context.switchToHttp().getRequest().user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
