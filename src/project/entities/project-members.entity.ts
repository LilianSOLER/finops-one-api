import { ApiProperty } from '@nestjs/swagger';
import { ProjectMember, ProjectRole } from '@prisma/client';
import { UserEntity } from '../../user/entities';

/**
 * Data Transfer Object (DTO) representing a project member entity.
 * Used for Swagger documentation purposes.
 */

export class ProjectMembersEntity implements ProjectMember {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  projectId: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  userId: string;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  @ApiProperty({
    enum: ProjectRole,
    type: 'string',
    description: 'Role of the user in the project',
  })
  role: ProjectRole;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
