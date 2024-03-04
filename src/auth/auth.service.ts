import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async signin(authDto: AuthDto) {
    const hash = await argon.hash(authDto.password);

    try {
      const res = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
        },
        select: {
          email: true,
          id: true,
        },
      });

      return this.signToken(res.email, res.id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials already exist');
        }
      }
      throw err;
    }
  }

  async get() {
    return await this.prisma.user.findMany();
  }

  async signup(authDto: AuthDto) {
    //get user from DB
    const user = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Email or password incorrect');
    }

    //check hash
    const check = await argon.verify(user.hash, authDto.password);

    //return token
    return await this.signToken(user.email, user.id);
  }

  async signToken(
    email: string,
    id: number,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: id,
      email,
    };
    const secret = this.config.get('AUTH_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
