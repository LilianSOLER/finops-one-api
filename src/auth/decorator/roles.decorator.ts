import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// Key used to retrieve roles metadata
export const ROLES_KEY = 'roles';

/**
 * Decorator to apply roles to a route handler.
 * @param roles User roles allowed to access the route.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
