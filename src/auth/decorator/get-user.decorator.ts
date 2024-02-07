import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Express } from 'express';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data) {
      // @ts-expect-error data is a string
      return request.user[data];
    }
    return request.user;
  },
);
