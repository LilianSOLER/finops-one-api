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

  /**
   * Create a new company.
   * @param createCompanyDto Data to create the company.
   * @returns The created company.
   */
  async create(createCompanyDto: CreateCompanyDto) {
    try {
      // Create a new company with the provided data (createCompanyDto), if optional fields are not provided, they will be set to null.
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

  /**
   * Retrieve all companies.
   * @returns List of all companies.
   */
  findAll() {
    // Retrieve all companies with their owner, company members and projects.
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

  /**
   * Retrieve a company by its ID.
   * @param id ID of the company to retrieve.
   * @returns The retrieved company.
   */
  findOne(id: string) {
    // Retrieve a company by its ID with its owner, company members and projects.
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

  /**
   * Update a company by its ID.
   * @param id ID of the company to update.
   * @param updateCompanyDto Data to update the company.
   */
  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    // Retrieve a company by its ID with its owner, company members and projects.
    const company = await this.prisma.company.findUnique({
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

    if (!updateCompanyDto.ownerId) {
      updateCompanyDto.ownerId = company.ownerId;
    }

    // Update the company with the provided data (updateCompanyDto)
    await this.prisma.$transaction([
      // Update the company with the provided data (updateCompanyDto)
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
      // Update the company members roles
      // Promote the user with the provided ID (updateCompanyDto.ownerId) to 'OWNER'
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
      // Demote old owner to member
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

  /**
   * Remove a company by its ID.
   * @param id ID of the company to remove.
   */
  remove(id: string) {
    // Retrieve a company by its ID with its owner, company members and projects.
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

  /**
   * Retrieve projects associated with a company.
   * @param id ID of the company.
   * @returns Projects associated with the company.
   */
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

    // Return the projects associated with the company
    return company.project;
  }

  /**
   * Retrieve all members of a company.
   * @param id The ID of the company.
   * @returns List of company members.
   * @throws NotFoundException if the company with the given ID is not found.
   */
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

  /**
   * Add a new member to a company.
   * @param id The ID of the company.
   * @param addMemberDto Data to add a member.
   * @returns The added company member.
   * @throws NotFoundException if the user or company with the given ID is not found.
   * @throws InternalServerErrorException if the user is already a member or if the company already has an owner.
   */
  async addMember(id: string, addMemberDto: AddMemberDto) {
    // Retrieve the user with the given ID
    const user = await this.prisma.user.findUnique({
      where: {
        id: addMemberDto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Retrieve the company with the given ID
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

    // If the role is not provided, set it to 'MEMBER' (default value) else use the provided value
    // Create a new company member with the provided data (addMemberDto) and associate it with the company
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

  /**
   * Update the role of a member in a company.
   * @param id The ID of the company.
   * @param userId The ID of the user.
   * @param updateMemberDto Data to update the member's role.
   * @throws NotFoundException if the company, user, or company member is not found.
   * @throws InternalServerErrorException if the company already has an owner.
   */
  async updateMember(
    id: string,
    userId: string,
    updateMemberDto: UpdateMemberDto,
  ) {
    // Retrieve the company with the given ID
    const company = await this.prisma.company.findUnique({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Retrieve the user with the given ID
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the role of the user with the given ID in the company with the given ID
    let owner = null;
    // If the new role is 'OWNER', check if the company already has an owner
    if (updateMemberDto.role === 'OWNER') {
      owner = await this.prisma.companyMember.findFirst({
        where: {
          companyId: company.id,
          role: 'OWNER',
        },
      });
    }

    // If the company already has an owner, throw an error
    if (owner) {
      throw new InternalServerErrorException('Company already has an owner');
    }

    // Else, update the role of the user with the given ID in the company with the given ID
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
