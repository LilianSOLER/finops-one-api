import { Controller, Get } from '@nestjs/common';
import { AzureService } from './app.service';

@Controller('azure')
export class AzureController {
  constructor(private readonly azureService: AzureService) {}

  @Get('cost-and-usage')
  async getCostData(): Promise<any> {
    const data = await this.azureService.getCostData();
    console.log(JSON.stringify(data, null, 2));
    return data;
  }
}
