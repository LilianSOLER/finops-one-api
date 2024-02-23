import { Controller, Get, Param, Post } from '@nestjs/common';
import { HerokuService } from './heroku.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('heroku')
export class HerokuController {
  constructor(private readonly herokuService: HerokuService) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  @Post()
  create() {
    return this.herokuService.create();
  }

  @Get()
  findAll() {
    return this.herokuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.herokuService.findOne(id);
  }
}
