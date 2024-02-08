import { ApiProperty } from '@nestjs/swagger';

export class GetMeResponseDto {
  @ApiProperty({
    example: '57c68330-6309-4b6b-ac98-b177c609d16b',
    description: 'User uuid',
  })
  id: string;

  @ApiProperty({ example: 'name@gmail.com', description: 'User email' })
  email: string;
}
