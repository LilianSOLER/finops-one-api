import { Company } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities';
import { CompanyMembersEntity } from './company-members.entity';
import { ProjectEntity } from '../../project/entities';

/**
 * Data Transfer Object (DTO) representing a company entity.
 * Used for Swagger documentation purposes.
 */
export class CompanyEntity implements Company {
  @ApiProperty({
    example: 'Company ID',
    description: 'Company ID',
  })
  id: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00Z',
    description: 'Date of creation of the company',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-01-01T00:00:00Z',
    description: 'Date of the last update of the company',
  })
  updatedAt: Date;

  @ApiProperty({ example: 'Company name', description: 'Company name' })
  name: string;

  @ApiProperty({
    example: 'Company description',
    description: 'Company description',
    required: false,
  })
  description: string | null;

  @ApiProperty({
    example: 'Company owner ID',
    description: 'Company owner ID',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Company owner',
  })
  owner: UserEntity;
  @ApiProperty({
    description: 'Company members',
    type: [CompanyMembersEntity],
  })
  companyMembers: CompanyMembersEntity[];

  @ApiProperty({
    description: 'Company projects',
    type: [ProjectEntity],
  })
  project: ProjectEntity[];
}
