import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
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
  // TODO Change the promise type to a more accurate type
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async getCostData(): Promise<any> {
    return await this.azureService.getCostData();
  }

  /**
   * Retrieves the Azure metrics.
   * @returns Promise that resolves to the Azure metrics data.
   */
  // TODO Change the promise type to a more accurate type
  @Get('metrics')
  async getAzureMetrics(): Promise<any> {
    return await this.azureService.getAzureMetrics();
  }

  /**
   * Retrieves the Azure metrics grouped by the specified criteria.
   *
   * @param {string} criteria - The criteria for grouping the metrics. Can be either 'resource-group' or 'resource-type'.
   *
   * @returns {Promise<any>} A promise that resolves to the Azure metrics data grouped by the specified criteria.
   *
   * @throws {Error} Throws an error if the criteria is not 'resource-group' or 'resource-type'.
   */
  // TODO Change the promise type to a more accurate type
  // TODO Add a 'metrics/sorted/:criteria:/:order' route to get the metrics sorted by the specified criteria and order
  @Get('metrics/sorted/:criteria')
  async getAzureMetricsSorted(
    @Param('criteria') criteria: string,
  ): Promise<any> {
    if (criteria === 'resource-group') {
      return await this.azureService.getAzureMetricsGroupedByResourceGroupAndDate();
    } else if (criteria === 'resource-type') {
      return await this.azureService.getAzureMetricsGroupedByResourceTypeAndDate();
    } else {
      throw new Error(`Invalid criteria: ${criteria}`);
    }
  }
}
