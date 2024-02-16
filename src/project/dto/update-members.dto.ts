import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class UpdateMemberDto {
  @ApiProperty({
    example: 'User role',
    description: 'User role',
    //type: ProjectRole,
  })
  @IsString()
  @IsIn(Object.values(ProjectRole))
  role: ProjectRole;
}
