import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SigninResponseDto, SignupResponseDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Bad request',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User has been successfully registered',
    type: SignupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Invalid credentials',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User has been successfully logged in',
    type: SigninResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
