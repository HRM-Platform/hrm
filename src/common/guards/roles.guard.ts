import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserProfile } from 'src/auth/interfaces/user-profile.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<{ user?: UserProfile }>();
    const user = request.user;

    console.log('---------');
    console.log('Required roles:', requiredRoles);
    console.log(user);
    console.log('---------');
    console.log(user?.role);
    if (!user) throw new ForbiddenException('User not found');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
