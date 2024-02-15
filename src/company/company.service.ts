import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const company = await this.prisma.company.create({
        data: {
          name: createCompanyDto.name,
          description: createCompanyDto.description,
          ownerId: createCompanyDto.ownerId,
          companyMembers: {
            create: {
              userId: createCompanyDto.ownerId,
              role: 'OWNER',
            },
          },
        },
        include: {
          owner: true,
          companyMembers: true,
        },
      });
      return company;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  findAll() {
    const company = this.prisma.company.findMany({
      include: {
        owner: true,
        companyMembers: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  findOne(id: string) {
    const company = this.prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        companyMembers: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = this.prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        companyMembers: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.$transaction([
      this.prisma.company.update({
        where: {
          id,
        },
        data: {
          name: updateCompanyDto.name,
          description: updateCompanyDto.description,
          ownerId: updateCompanyDto.ownerId,
        },
        include: {
          owner: true,
          companyMembers: {
            include: {
              user: true,
            },
          },
          project: true,
        },
      }),
      this.prisma.companyMember.updateMany({
        where: {
          companyId: id,
          userId: updateCompanyDto.ownerId,
          role: 'MEMBER',
        },
        data: {
          role: 'OWNER',
        },
      }),
      this.prisma.companyMember.updateMany({
        where: {
          companyId: id,
          userId: {
            not: updateCompanyDto.ownerId,
          },
          role: 'OWNER',
        },
        data: {
          role: 'MEMBER',
        },
      }),
    ]);
  }

  remove(id: string) {
    const company = this.prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        companyMembers: {
          include: {
            user: true,
          },
        },
        project: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    this.prisma.company.delete({
      where: {
        id,
      },
    });
  }

  async getProjects(id: string) {
    const company = await this.prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          include: {
            owner: true,
            projectMembers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company.project;
  }

  async getMembers(id: string) {
    const company = await this.prisma.company.findUnique({
      where: {
        id,
      },
      include: {
        companyMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company.companyMembers;
  }
}
