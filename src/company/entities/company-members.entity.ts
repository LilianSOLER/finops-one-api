import { ApiProperty } from '@nestjs/swagger';
import { CompanyMember, CompanyRole } from '@prisma/client';
import { UserEntity } from '../../user/entities';

export class CompanyMembersEntity implements CompanyMember {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  companyId: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  userId: string;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  @ApiProperty({
    enum: CompanyRole,
    type: 'string',
    description: 'Role of the user in the company',
  })
  role: CompanyRole;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
