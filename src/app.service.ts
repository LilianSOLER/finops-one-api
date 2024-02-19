import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DefaultAzureCredential } from '@azure/identity';
// import { ClientSecretCredential } from '@azure/identity';
import { BillingManagementClient } from '@azure/arm-billing';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AzureService {
  private baseUrl = 'https://management.azure.com';
  private readonly logger = new Logger(AzureService.name);
  private readonly prisma = new PrismaClient();

  constructor() {
    this.getCostData().catch((error) => {
      this.logger.error('Error while getting cost data', error.stack);
    });
  }

  async getCostData(): Promise<any[]> {
    try {
      // const tenantId = '<Your Tenant ID>';
      // const clientId = '<Your Client ID>';
      // const clientSecret = '<Your Client Secret>';
      // const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken(
        'https://management.azure.com/.default',
      );
      const accessToken = tokenResponse.token;
      const currentDate = new Date();
      const currentDateString = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${currentDate
        .getDate()
        .toString()
        .padStart(2, '0')}`;

      // https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list?view=rest-resources-2022-12-01&tabs=HTTP
      const subscriptionsUrl = `${this.baseUrl}/subscriptions?api-version=2022-12-01`;
      const subscriptionsResponse = await axios.get(subscriptionsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const results = [];
      for (const subscription of subscriptionsResponse.data.value) {
        const subscriptionId = subscription.subscriptionId;

        const client = new BillingManagementClient(credential, subscriptionId);

        const resArray = [];
        for await (const item of client.billingPeriods.list()) {
          resArray.push(item);
        }
        console.log(resArray);

        // ResArray is a list of the available billing periods for a subscription in reverse chronological order, so the last one is the oldest
        //const lastItem = resArray[resArray.length - 1];

        //const billingPeriodStartDate = lastItem.billingPeriodStartDate.toISOString().slice(0, 10);

        // https://learn.microsoft.com/en-us/rest/api/cost-management/query/usage?view=rest-cost-management-2023-11-01&tabs=HTTP#subscriptionquery-legacy
        const usageUrl = `${this.baseUrl}/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-11-01`;
        const usageBody = {
          type: 'Usage',
          timeframe: 'Custom',
          timePeriod: {
            from: '2023-10-01', // The start date of the oldest billing period, it's for safety because we get error 400 if the custom date begins before the subscription date creation
            // (but we currently can't get this value so we use the oldest billing period start date as a workaround)
            to: currentDateString,
          },
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
        const usageResponse = await axios.post(usageUrl, usageBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // https://learn.microsoft.com/en-us/rest/api/billing/billing-property/get?view=rest-billing-2020-05-01&tabs=HTTP
        const billingResponse = await client.billingPropertyOperations.get();
        const billingAccountId = billingResponse.billingAccountId;

        // https://learn.microsoft.com/en-us/rest/api/consumption/budgets/list?view=rest-consumption-2023-05-01&tabs=HTTP
        const budgetsUrl = `${this.baseUrl}${billingAccountId}/providers/Microsoft.Consumption/budgets?api-version=2023-05-01`;
        const budgetsResponse = await axios.get(budgetsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // https://learn.microsoft.com/en-us/rest/api/cost-management/alerts/list?view=rest-cost-management-2023-11-01&tabs=HTTP#billingaccountalerts
        const alertsUrl = `${this.baseUrl}${billingAccountId}/providers/Microsoft.CostManagement/alerts?api-version=2023-11-01`;
        const alertsResponse = await axios.get(alertsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        results.push({
          costAndUsage: usageResponse.data,
          budgets: budgetsResponse.data,
          alerts: alertsResponse.data,
        });

        // Parse and store data in Prisma models
        await this.parseAndStoreData(
          usageResponse.data,
          budgetsResponse.data,
          alertsResponse.data,
        );
      }

      return results;
    } catch (error) {
      this.logger.error('Error while getting cost data', error.stack);
      throw error;
    }
  }

  convertToDate(usageDate) {
    const year = usageDate.slice(0, 4);
    const month = usageDate.slice(4, 6);
    const day = usageDate.slice(6, 8);

    return new Date(`${year}-${month}-${day}`);
  }

  async parseAndStoreData(
    costAndUsageData: any,
    budgetsData: any,
    alertsData: any,
  ): Promise<void> {
    // Parse and store CostAndUsage data
    await this.prisma.costAndUsage.create({
      data: {
        id: costAndUsageData.id,
        name: costAndUsageData.name,
        type: costAndUsageData.type,
        etag: costAndUsageData.eTag,
        values: {
          create: costAndUsageData.properties.rows.map((row: any) => {
            return {
              cost: row[0],
              usageDate: this.convertToDate(row[1].toString()),
              currency: row[2],
            };
          }),
        },
      },
    });

    // Parse and store Budgets data
    await Promise.all(
      budgetsData.value.map(async (budgetData: any) => {
        return await this.prisma.budget.create({
          data: {
            id: budgetData.id,
            name: budgetData.name,
            type: budgetData.type,
            eTag: budgetData.eTag,
            startDate: new Date(budgetData.properties.timePeriod.startDate),
            endDate: new Date(budgetData.properties.timePeriod.endDate),
            timeGrain: budgetData.properties.timeGrain,
            amount: budgetData.properties.amount,
            currentSpend: budgetData.properties.currentSpend.amount,
            unit: budgetData.properties.currentSpend.unit,
            category: budgetData.properties.category,
          },
        });
      }),
    );

    // Parse and store Alerts data
    await Promise.all(
      alertsData.value.map(async (alertData: any) => {
        return await this.prisma.alert.create({
          data: {
            id: alertData.id,
            name: alertData.name,
            type: alertData.type,
            alertType: alertData.properties.definition.type,
            alertCategory: alertData.properties.definition.category,
            alertCriteria: alertData.properties.definition.criteria,
            description: alertData.properties.description,
            source: alertData.properties.source,
            timeGrainType: alertData.properties.details.timeGrainType,
            periodStartDate: new Date(
              alertData.properties.details.periodStartDate,
            ),
            triggeredBy: alertData.properties.details.triggeredBy,
            threshold: alertData.properties.details.threshold,
            operator: alertData.properties.details.operator,
            amount: alertData.properties.details.amount,
            unit: alertData.properties.details.unit,
            currentSpend: alertData.properties.details.currentSpend,
            costEntityId: alertData.properties.costEntityId,
            status: alertData.properties.status,
            creationTime: new Date(alertData.properties.creationTime),
            closeTime: new Date(alertData.properties.closeTime),
            modificationTime: new Date(alertData.properties.modificationTime),
            statusModificationTime: new Date(
              alertData.properties.statusModificationTime,
            ),
          },
        });
      }),
    );
  }
}
