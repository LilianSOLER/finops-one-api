import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Express } from 'express';

/**
 * Custom parameter decorator to extract user information from the request object.
 * @param data Optional data indicating specific user property to retrieve.
 * @param ctx ExecutionContext containing request information.
 * @returns Returns user information or specific user property.
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Retrieve the request object from the context
    const request: Express.Request = ctx.switchToHttp().getRequest();

    // If data is provided, return the specific user property
    if (data) {
      // Use bracket notation to access user property dynamically
      // @ts-expect-error data is a string
      return request.user[data];
    }

    // If no data is provided, return the entire user object
    return request.user;
  },
);
