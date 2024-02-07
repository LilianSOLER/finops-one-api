import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DefaultAzureCredential } from '@azure/identity';

@Injectable()
export class AzureService {
  private baseUrl = 'https://management.azure.com/';
  private subscriptionId = '7963ac02-acc9-4f14-897d-c2404e77f3ad';
  private readonly logger = new Logger(AzureService.name);

  async getCostData(): Promise<any> {
    try {
      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken(
        'https://management.azure.com/.default',
      );
      const accessToken = tokenResponse.token;

      const url = `${this.baseUrl}subscriptions/${this.subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-11-01`;

      const usageBody = {
        type: 'Usage',
        timeframe: 'MonthToDate',
        dataset: {
          granularity: 'Daily',
          aggregation: {
            totalCost: {
              name: 'Cost',
              function: 'Sum',
            },
          },
        },
      };

      const usageResponse = await axios.post(url, usageBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const analysisBody = {
        type: 'ActualCost',
        timeframe: 'MonthToDate',
        dataset: {
          granularity: 'Daily',
          aggregation: {
            totalCost: {
              name: 'Cost',
              function: 'Sum',
            },
          },
        },
      };

      const analysisResponse = await axios.post(url, analysisBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const budgetsUrl = `${this.baseUrl}subscriptions/${this.subscriptionId}/providers/Microsoft.Consumption/budgets?api-version=2023-05-01`;

      const budgetsResponse = await axios.get(budgetsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const alertsUrl = `${this.baseUrl}subscriptions/${this.subscriptionId}/providers/Microsoft.CostManagement/alerts?api-version=2023-11-01`;

      const alertsResponse = await axios.get(alertsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        costAndUsage: usageResponse.data,
        costAnalysis: analysisResponse.data,
        budgets: budgetsResponse.data,
        alerts: alertsResponse.data,
      };
    } catch (error) {
      this.logger.error('Error while getting cost data', error.stack);
      throw error;
    }
  }
}
