import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAccessToken } from '@shared/interfaces';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAccessToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
