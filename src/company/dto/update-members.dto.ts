import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { CompanyRole } from '@prisma/client';

export class UpdateMemberDto {
  @ApiProperty({
    example: 'User role',
    description: 'User role',
    //type: CompanyRole,
  })
  @IsString()
  @IsIn(Object.values(CompanyRole))
  role: CompanyRole;
}
