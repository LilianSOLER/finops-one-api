import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let res = null;
    try {
      res = await this.authService.signup(createUserDto);
    } catch (e) {
      throw e;
    }
    if (createUserDto.firstName || createUserDto.lastName) {
      try {
        res = await this.prismaService.user.update({
          where: { id: res.id },
          data: {
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
          },
          select: {
            id: true,
            email: true,
          },
        });
      } catch (e) {
        throw e;
      }
    }
    return res;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
