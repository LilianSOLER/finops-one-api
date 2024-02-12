import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signin(@Body() authDto : AuthDto){
    console.log(
      authDto,
    );
    return this.authService.signin(authDto);
  }

 
  @Get('signin')
  getUsers(){
    return this.authService.get();
  }

  @Post('signup')
  signup(@Body() authDto : AuthDto){
    return this.authService.signup(authDto);
  }
}
