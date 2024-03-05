import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Project name',
    description: 'Project name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Project description',
    description: 'Project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
