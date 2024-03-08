import { Module } from '@nestjs/common';
import { AzureService } from './azure.service';
import { AzureController } from './azure.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [AzureService],
  controllers: [AzureController],
})
export class AzureModule {}
