import { ApiProperty } from '@nestjs/swagger';
import { ProjectEntity } from '../../project/entities';
import { UserEntity } from '../entities';
import { ProjectMember, ProjectRole } from '@prisma/client';

export class ProjectEntityAux extends ProjectEntity {
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
}

export class ProjectMembersEntityAux implements ProjectMember {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  projectId: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  userId: string;

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

  @ApiProperty({ type: ProjectEntityAux })
  project: ProjectEntityAux;
}

export class GetMeResponseDto {
  @ApiProperty({
    example: '57c68330-6309-4b6b-ac98-b177c609d16b',
    description: 'User uuid',
  })
  id: string;

  @ApiProperty({ example: 'name@gmail.com', description: 'User email' })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  lastName: string;

  @ApiProperty({
    example: '2021-08-12T15:58:52.000Z',
    description: 'User created at',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-08-12T15:58:52.000Z',
    description: 'User updated at',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [ProjectMembersEntityAux],
    description: 'User projects',
  })
  projectMembers: ProjectMembersEntityAux[];
}
