import { Project } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities';
import { ProjectMembersEntity } from './project-members.entity';

/**
 * Data Transfer Object (DTO) representing a project entity.
 * Used for Swagger documentation purposes.
 */

export class ProjectEntity implements Project {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string' })
  name: string;

  @ApiProperty({ type: 'string', nullable: true })
  description: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Owner of the project',
  })
  ownerId: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'Owner of the project',
  })
  owner: UserEntity;

  @ApiProperty({
    type: () => [ProjectMembersEntity],
    description: 'Members of the project',
  })
  members: ProjectMembersEntity[];

  @ApiProperty({ type: 'string', format: 'uuid' })
  companyId: string;
}
