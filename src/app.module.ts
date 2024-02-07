import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AzureService } from './app.service';
import { AzureController } from './app.controller';

@Module({
  imports: [HttpModule],
  controllers: [AzureController],
  providers: [AzureService],
})
export class AppModule {}
