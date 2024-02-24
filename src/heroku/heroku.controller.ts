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

@Controller('heroku')
export class HerokuController {
  constructor(private readonly herokuService: HerokuService) {}

  @HttpCode(HttpStatus.CREATED)
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  @Post()
  create() {
    return this.herokuService.create();
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.herokuService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.herokuService.findOne(id);
  }
}
