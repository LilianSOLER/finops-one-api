import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Guard to protect routes using JWT authentication.
 */
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
