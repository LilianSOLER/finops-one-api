import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Project name', description: 'Project name' })
  name: string;

  @ApiProperty({
    example: 'Project description',
    description: 'Project description',
    nullable: true,
  })
  description: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}
