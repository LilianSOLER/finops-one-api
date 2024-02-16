import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AddMemberDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateMemberDto,
} from './dto/';
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

  async addMember(id: string, addMemberDto: AddMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: addMemberDto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.prisma.company.findUnique({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isMember = await this.prisma.companyMember.findFirst({
      where: {
        companyId: company.id,
        userId: addMemberDto.userId,
      },
    });

    if (isMember) {
      throw new InternalServerErrorException('User is already a member');
    }

    const companyMember = await this.prisma.company.update({
      where: {
        id: company.id,
      },
      data: {
        companyMembers: {
          create: {
            userId: addMemberDto.userId,
            role: addMemberDto.role,
          },
        },
      },
    });

    return companyMember;
  }

  async updateMember(
    id: string,
    userId: string,
    updateMemberDto: UpdateMemberDto,
  ) {
    const company = await this.prisma.company.findUnique({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let owner = null;
    if (updateMemberDto.role === 'OWNER') {
      owner = await this.prisma.companyMember.findFirst({
        where: {
          companyId: company.id,
          role: 'OWNER',
        },
      });
    }

    if (owner) {
      throw new InternalServerErrorException('Company already has an owner');
    }

    const companyMember = await this.prisma.companyMember.updateMany({
      where: {
        companyId: company.id,
        userId,
      },
      data: {
        role: updateMemberDto.role,
      },
    });

    if (!companyMember) {
      throw new NotFoundException('Company member not found');
    }
  }
}
