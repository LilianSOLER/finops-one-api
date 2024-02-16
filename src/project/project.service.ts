import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, owner: User) {
    try {
      const user = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          ownerId: owner.id,
          companyId: createProjectDto.companyId,
          projectMembers: {
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
}
