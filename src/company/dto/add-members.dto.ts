import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CompanyRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({ example: 'User ID', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'User role',
    description: 'User role',
    required: false,
  })
  @IsString()
  @IsIn(Object.values(CompanyRole))
  @IsOptional()
  role?: CompanyRole;
}
