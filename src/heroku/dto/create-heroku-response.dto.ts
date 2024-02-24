import { ApiProperty } from '@nestjs/swagger';

export class CreateHerokuResponseDto {
  @ApiProperty({
    type: 'string',
    description: 'The message to display',
  })
  message: string;
}
