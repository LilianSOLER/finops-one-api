import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { HerokuService } from './heroku.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateHerokuResponseDto } from './dto';
import { HerokuEntity } from './entities';

@ApiTags('heroku')
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Not found',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('heroku')
export class HerokuController {
  constructor(private readonly herokuService: HerokuService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateHerokuResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  @Post()
  create() {
    return this.herokuService.create();
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: [HerokuEntity],
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.herokuService.findAll();
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: HerokuEntity,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.herokuService.findOne(id);
  }
}
