import { Controller, Get } from '@nestjs/common';
import { AzureService } from './azure.service';
//import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('azure')
export class AzureController {
  constructor(private readonly azureService: AzureService) {}

  //@Cron(CronExpression.EVERY_DAY_AT_1AM)
  @Get('cost-and-usage')
  async getCostData(): Promise<any> {
    const data = await this.azureService.getCostData();
    return data;
  }

  @Get('metrics')
  async getAzureMetrics(): Promise<any> {
    console.log('Query Azure metrics');
    const data = await this.azureService.getAzureMetrics();
    return data;
  }
}
