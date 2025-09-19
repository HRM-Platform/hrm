import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../../auth/interfaces/user-profile.interface';

export const CurrentUser = createParamDecorator(
  (
    data: keyof UserProfile | undefined,
    ctx: ExecutionContext,
  ): UserProfile | UserProfile[keyof UserProfile] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserProfile }>();
    if (!request.user) return undefined;
    return data ? request.user[data] : request.user;
  },
);
