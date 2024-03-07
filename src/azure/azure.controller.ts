import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AzureService } from './azure.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiTags('azure')
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Not found',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
@Controller('azure')
/**
 * Controller class for handling Azure related requests.
 */
export class AzureController {
  constructor(private readonly azureService: AzureService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The record has been successfully created.',
  })
  @HttpCode(HttpStatus.CREATED)

  /**
   * Retrieves the Azure costs data and stores it in the database.
   * @returns Promise that resolves to the Azure costs data.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async getCostData() {
    const data = await this.azureService.getCostData();
    return data;
  }

  /**
   * Retrieves the Azure metrics.
   * @returns Promise that resolves to the Azure metrics data.
   */
  @Get('metrics')
  async getAzureMetrics() {
    return await this.azureService.getAzureMetrics();
  }

  /**
   * Retrieves the Azure metrics grouped by resource group.
   * @returns Promise that resolves to the Azure metrics data grouped by resource group.
   */
  @Get('/metrics/sorted/resource-group')
  async getAzureMetricsGroupedByResourceGroup() {
    return await this.azureService.getAzureMetricsGroupedByResourceGroupAndDate();
  }

  /**
   * Retrieves the Azure metrics grouped by resource type.
   * @returns Promise that resolves to the Azure metrics data grouped by resource type.
   */
  @Get('/metrics/sorted/resource-type')
  async getAzureMetricsGroupedByResourceType() {
    return await this.azureService.getAzureMetricsGroupedByResourceTypeAndDate();
  }
}
