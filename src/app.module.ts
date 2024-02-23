import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HerokuModule } from './heroku/heroku.module';

@Module({
  imports: [ConfigModule.forRoot(), HerokuModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
