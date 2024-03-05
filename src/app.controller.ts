import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Controller responsible for handling requests related to the home route.
 */
@ApiTags('home')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint to get the "Hello world" message.
   * @returns Returns the "Hello world" message.
   */
  @ApiOperation({ summary: 'Get hello world' })
  @ApiResponse({ status: 200, description: 'Hello world' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
