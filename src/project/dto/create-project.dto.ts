import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project name', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Project description',
    description: 'Project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
