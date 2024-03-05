import { SetMetadata } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';

// Key used to retrieve project roles metadata
export const PROJECT_ROLES_KEY = 'project-roles';

/**
 * Decorator to apply project roles to a route handler.
 * @param roles Project roles allowed to access the route.
 */
export const ProjectRoles = (...roles: ProjectRole[]) =>
  SetMetadata(PROJECT_ROLES_KEY, roles);
