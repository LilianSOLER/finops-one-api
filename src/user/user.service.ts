import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import * as argon from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  /**
   * Create a new user.
   * @param createUserDto - The data for creating a new user.
   * @returns The newly created user.
   */
  async create(createUserDto: CreateUserDto) {
    // Create a new user using the auth service
    let res = null;
    try {
      res = await this.authService.signup(createUserDto);
    } catch (e) {
      throw e;
    }

    // If the user's first name or last name is provided, update the user with the provided data
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
    // Return the newly created user or the updated user
    return res;
  }

  /**
   * Find all users.
   * @returns A list of all users.
   */
  async findAll() {
    const user = await this.prismaService.user.findMany();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find a user by ID.
   * @param id - The ID of the user to find.
   * @returns The found user.
   */
  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update a user by ID.
   * @param id - The ID of the user to update.
   * @param updateUserDto - The data to update the user.
   * @returns The updated user.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Find the user by ID
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If the user's password is provided, hash the password and update the user with the provided data
    if (updateUserDto.password) {
      const hash = await argon.hash(updateUserDto.password);
      // Delete the password from the update user data
      // @ts-expect-error password must be replaced with hashedPassword
      delete updateUserDto.password;

      return this.prismaService.user.update({
        where: { id },
        data: { ...updateUserDto, hashedPassword: hash },
      });
    }

    // @ts-expect-error password must be replaced with hashedPassword
    delete updateUserDto.password;

    console.log(updateUserDto);

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  /**
   * Remove a user by ID.
   * @param id - The ID of the user to remove.
   * @returns The removed user.
   */
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

  /**
   * Get the details of the currently authenticated user.
   * @param user - The authenticated user.
   * @returns The details of the authenticated user.
   */
  getMe(user: User) {
    // Find the user by ID and include the user's project and company members
    return this.prismaService.user.findUnique({
      where: { id: user.id },
      include: {
        projectMember: {
          include: {
            project: true,
          },
        },
        companyMember: {
          include: {
            company: true,
          },
        },
      },
    });
  }
}
