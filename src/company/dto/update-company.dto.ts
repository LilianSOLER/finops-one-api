import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    example: 'Company name',
    description: 'Company name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Company description',
    description: 'Company description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Company owner ID',
    description: 'Company owner ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  ownerId?: string;
}
