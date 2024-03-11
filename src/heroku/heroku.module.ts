import { Module } from '@nestjs/common';
import { HerokuService } from './heroku.service';
import { HerokuController } from './heroku.controller';

@Module({
  controllers: [HerokuController],
  providers: [HerokuService],
})
export class HerokuModule {}
