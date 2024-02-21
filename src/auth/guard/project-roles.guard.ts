import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROJECT_ROLES_KEY } from '../decorator';
import { ProjectRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
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
      PROJECT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Get the user from the request
    const user = request.user;

    // Get the project ID from the request
    const projectId: string = context.switchToHttp().getRequest().params.id;

    // Check if the user has the required roles for the project
    const userRole = await this.prisma.projectMember.findMany({
      where: { projectId: projectId, userId: user.id },
      select: { role: true },
    });

    // If the user has no roles, deny access
    if (!userRole.length) {
      return false;
    }

    // Check if the user has the required roles
    return requiredRoles.some((role) => userRole[0].role === role);
  }
}
