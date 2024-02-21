import { SetMetadata } from '@nestjs/common';
import { CompanyRole } from '@prisma/client';

// Key used to retrieve company roles metadata
export const COMPANY_ROLES_KEY = 'company-roles';

/**
 * Decorator to apply company roles to a route handler.
 * @param roles Company roles allowed to access the route.
 */
export const CompanyRoles = (...roles: CompanyRole[]) =>
  SetMetadata(COMPANY_ROLES_KEY, roles);
