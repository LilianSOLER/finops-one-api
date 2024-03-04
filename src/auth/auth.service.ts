import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Sign in a user.
   * @param {AuthDto} dto - User's credentials.
   * @returns {Promise<{ access_token: string }>} - JWT token.
   * @throws {ForbiddenException} - Thrown if invalid credentials.
   */
  async signin(dto: AuthDto): Promise<{ access_token: string }> {
    // find the user in the database
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // if the user is not found, throw an error
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // compare the password hashes
    const match = await argon.verify(user.hashedPassword, dto.password);
    // if the password hashes don't match, throw an error
    if (!match) {
      throw new ForbiddenException('Invalid credentials');
    }
    return this.signToken(user.id, user.email);
  }

  /**
   * Sign up a user.
   * @param {AuthDto} dto - User's credentials.
   * @returns {Promise<{ id: string, email: string }>} - Newly created user.
   * @throws {ForbiddenException} - Thrown if credentials are taken.
   * @throws {Error} - Thrown if any other error occurs during signup.
   */
  async signup(dto: AuthDto): Promise<{ id: string; email: string }> {
    // generate a hash of the password
    const hash = await argon.hash(dto.password);
    // save the user in the database
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hash,
        },
        select: {
          id: true,
          email: true,
        },
      });
      return user;
    } catch (e) {
      // if the error is a known Prisma error, throw a ForbiddenException with a custom message
      if (e instanceof PrismaClientKnownRequestError) {
        // P2002 is the error code for unique constraint violation
        if (e.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw e;
    }
  }

  /**
   * Sign a token.
   * @param {string} userId - User's ID.
   * @param {string} email - User's email.
   * @returns {Promise<{ access_token: string }>} - Signed JWT token.
   */
  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    // sign the token with the user's ID and email
    const payload = { sub: userId, email };
    // sign the token with the payload and the secret from the config
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }
}
