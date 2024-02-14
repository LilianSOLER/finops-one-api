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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      COMPANY_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const companyId: string = context.switchToHttp().getRequest().params.id;

    const userRole = await this.prisma.companyMember.findMany({
      where: { companyId: companyId, userId: user.id },
      select: { role: true },
    });

    if (!userRole.length) {
      return false;
    }

    return requiredRoles.some((role) => userRole[0].role === role);
  }
}
