import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import * as argon from 'argon2';

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

  async findAll() {
    const user = await this.prismaService.user.findMany();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      const hash = await argon.hash(updateUserDto.password);
      // @ts-expect-error password must be replaced with hashedPassword
      delete updateUserDto.password;

      return this.prismaService.user.update({
        where: { id },
        data: { ...updateUserDto, hashedPassword: hash },
      });
    }

    // @ts-expect-error password must be replaced with hashedPassword
    delete updateUserDto.password;

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
