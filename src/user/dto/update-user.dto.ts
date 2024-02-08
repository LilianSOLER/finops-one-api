import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'name@gmail.com',
    description: 'User email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'User password',
    required: false,
  })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
