import { ApiProperty } from '@nestjs/swagger';

export class SigninResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3N2JlZmE0YS0yNTE4LTRkNjMtOGQ5YS1jMzczMmIyZDgwMzgiLCJlbWFpbCI6InNvbGVyLmxpbGlhbjY0QGdtYWlsLmNvbSIsImlhdCI6MTcwNzMyNTg2MCwiZXhwIjoxNzA3MzI2NzYwfQ.iE6h9bLd4zpd_oUzrf7ABUGIGeul-PCGPotrBY5mp18',
    description: 'Access token for the user',
  })
  accessToken: string;
}
