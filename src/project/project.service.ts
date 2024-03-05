import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AddMemberDto,
  CreateProjectDto,
  UpdateMemberDto,
  UpdateProjectDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new project.
   * @param createProjectDto - The data for creating a new project.
   * @param owner - The owner of the project.
   * @returns The newly created project.
   */
  async create(createProjectDto: CreateProjectDto, owner: User) {
    try {
      const user = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          ownerId: owner.id,
          companyId: createProjectDto.companyId,
          projectMembers: {
            // Add the owner as a member of the project.
            create: {
              userId: owner.id,
              role: 'OWNER',
            },
          },
        },
        include: {
          owner: true,
          projectMembers: true,
          company: true,
        },
      });
      return user;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  /**
   * Retrieve all projects.
   * @returns List of all projects.
   * @throws {NotFoundException} If no projects are found.
   */
  async findAll() {
    const project = await this.prisma.project.findMany({
      include: {
        owner: true,
        projectMembers: {
          include: {
            user: true,
          },
        },
        company: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Retrieve a project by its ID.
   * @param id - The ID of the project.
   * @returns The project with the specified ID.
   * @throws {NotFoundException} If the project with the given ID does not exist.
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        projectMembers: {
          include: {
            user: true,
          },
        },
        company: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Update a project.
   * @param id - The ID of the project to update.
   * @param updateProjectDto - Data for updating the project.
   * @returns The updated project.
   * @throws {NotFoundException} If the project to update is not found.
   */
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        projectMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name,
        description: updateProjectDto.description,
      },
      include: {
        owner: true,
        projectMembers: {
          include: {
            user: true,
          },
        },
        company: true,
      },
    });
  }

  /**
   * Delete a project.
   * @param id - The ID of the project to delete.
   * @returns The deleted project.
   * @throws {NotFoundException} If the project to delete is not found.
   */
  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.prisma.project.delete({
      where: { id },
      include: {
        owner: true,
        projectMembers: {
          include: {
            user: true,
          },
        },
        company: true,
      },
    });
  }

  /**
   * Get all members of a project.
   * @param id - The ID of the project.
   * @returns List of all project members.
   * @throws {NotFoundException} If the project is not found.
   */
  async getMembers(id: string) {
    const project = this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const tmp = await this.prisma.project.findUnique({
      where: { id: id },
      include: {
        projectMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!tmp) {
      throw new NotFoundException('Project not found');
    }

    return tmp.projectMembers;
  }

  /**
   * Add a member to a project.
   * @param id - The ID of the project.
   * @param addMemberDto - Data for adding a member to the project.
   * @returns The added project member.
   * @throws {NotFoundException} If the project or user is not found.
   * @throws {InternalServerErrorException} If the user is already a member.
   */
  async addMember(id: string, addMemberDto: AddMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: addMemberDto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      throw new NotFoundException('Company not found');
    }

    const isMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId: addMemberDto.userId,
      },
    });

    if (isMember) {
      throw new InternalServerErrorException('User is already a member');
    }

    const projectMember = await this.prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        projectMembers: {
          create: {
            userId: addMemberDto.userId,
            role: addMemberDto.role,
          },
        },
      },
    });

    return projectMember;
  }

  /**
   * Update the role of a project member.
   * @param id - The ID of the project.
   * @param userId - The ID of the user whose role is being updated.
   * @param updateMemberDto - Data for updating the member's role.
   * @throws {NotFoundException} If the project or user is not found.
   * @throws {InternalServerErrorException} If the project already has an owner or if the member is not found.
   */
  async updateMember(
    id: string,
    userId: string,
    updateMemberDto: UpdateMemberDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the project already has an owner.
    let owner = null;
    if (updateMemberDto.role === 'OWNER') {
      owner = await this.prisma.projectMember.findFirst({
        where: {
          projectId: project.id,
          role: 'OWNER',
        },
      });
    }

    if (owner) {
      throw new InternalServerErrorException('Project already has an owner');
    }

    const projectMember = await this.prisma.projectMember.updateMany({
      where: {
        projectId: project.id,
        userId,
      },
      data: {
        role: updateMemberDto.role,
      },
    });

    if (!projectMember) {
      throw new NotFoundException('Project member not found');
    }
  }
}
