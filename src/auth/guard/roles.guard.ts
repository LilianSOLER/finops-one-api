import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  /**
   * Checks if the user has the required roles to access the resource.
   * @param context ExecutionContext containing request information.
   * @returns Returns true if the user has required roles, false otherwise.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve required roles from the metadata
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Get the user from the request
    const user = request.user;

    // Retrieve user role from the database
    const userRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    // If the user does not have a role, deny access
    if (!userRole) {
      return false;
    }

    // If the user has the required role, allow access
    return requiredRoles.some((role) => userRole.role === role);
  }
}
