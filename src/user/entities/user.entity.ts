import { User, UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', format: 'email' })
  email: string;

  @ApiProperty({ type: 'string', format: 'password' })
  hashedPassword: string;

  @ApiProperty({ type: 'string', nullable: true })
  firstName: string;

  @ApiProperty({ type: 'string', nullable: true })
  lastName: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
