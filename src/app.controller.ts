import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('home')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get hello world' })
  @ApiResponse({ status: 200, description: 'Hello world' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
