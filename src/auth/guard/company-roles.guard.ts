import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { COMPANY_ROLES_KEY } from '../decorator';

@Injectable()
export class CompanyRolesGuard implements CanActivate {
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
      COMPANY_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Retrieve user information from the request
    const user = request.user;

    // Retrieve company ID from the request
    const companyId: string = context.switchToHttp().getRequest().params.id;

    // Retrieve user role for the specified company
    const userRole = await this.prisma.companyMember.findMany({
      where: { companyId: companyId, userId: user.id },
      select: { role: true },
    });

    // If the user has no role for the company, deny access
    if (!userRole.length) {
      return false;
    }

    // Check if the user has any of the required roles
    return requiredRoles.some((role) => userRole[0].role === role);
  }
}
