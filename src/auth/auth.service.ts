import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
 constructor(private prisma : PrismaService){}

  async signin(authDto : AuthDto){

    const hash = await argon.hash(authDto.password);


    const res = await this.prisma.user.create({
      data : {
        email : authDto.email,
        hash,
      },
      select :{
        email : true
      }
    });


    return res;
  }

  async get(){
    return await this.prisma.user.findMany();
  }


  signup(authDto : AuthDto){

  }
}
