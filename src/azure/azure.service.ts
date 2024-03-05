import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DefaultAzureCredential } from '@azure/identity';
// import { ClientSecretCredential } from '@azure/identity';
import { BillingManagementClient } from '@azure/arm-billing';
import { SubscriptionClient } from '@azure/arm-resources-subscriptions';
import { PrismaClient } from '@prisma/client';

// AzureService handles interactions with Azure's APIs. It retrieves cost data and stores it in the database.
@Injectable()
export class AzureService {
  private baseUrl = 'https://management.azure.com';
  private readonly logger = new Logger(AzureService.name);
  private readonly prisma = new PrismaClient();

  /**
   * Constructor initializes the AzureService by calling the getCostData method.
   * If an error occurs during this process, it is logged.
   */
  constructor() {
    this.getCostData().catch((error) => {
      this.logger.error('Error while getting cost data', error.stack);
    });
  }

  /**
   * The getCostData method retrieves cost data from Azure's APIs.
   * It authenticates using the DefaultAzureCredential, which works in a variety of Azure hosting environments.
   * But it should use the ClientSecretCredential, which requires a Tenant ID, Client ID, and Client Secret.
   * It then makes several HTTP requests to different Azure APIs to gather cost, budget, and alert data.
   * This data is then parsed and stored in the database using the parseAndStoreData method.
   * @returns {Promise<any[]>} An array of objects containing the cost, budget, and alert data for each subscription.
   */
  async getCostData(): Promise<any[]> {
    try {
      // const tenantId = '<Your Tenant ID>';
      // const clientId = '<Your Client ID>';
      // const clientSecret = '<Your Client Secret>';
      // const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

      // Using DefaultAzureCredential for authentication
      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken(
        'https://management.azure.com/.default',
      );
      const accessToken = tokenResponse.token;
      const currentDate = new Date();

      // function to format date to 'YYYY-MM-DD' format to use in the API request
      function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      const currentDateString = formatDate(currentDate);

      // Using the SubscriptionClient to interact with the Azure Subscriptions API. This returns a list of subscriptions for the authenticated user.
      // https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list?view=rest-resources-2022-12-01&tabs=HTTP
      const subClient = new SubscriptionClient(credential);

      const results = [];

      // For each subscription, we make several HTTP requests to different Azure APIs to gather cost, budget, and alert data.
      for await (const subscription of subClient.subscriptions.list()) {
        const subscriptionId = subscription.subscriptionId;
        if (subscriptionId) {
          const client = new BillingManagementClient(
            credential,
            subscriptionId,
          ); // Using the BillingManagementClient to interact with the Azure Billing API.

          // Making a GET request to the /billingProperty endpoint to retrieve the billing account ID for the subscription.
          // https://learn.microsoft.com/en-us/rest/api/billing/billing-property/get?view=rest-billing-2020-05-01&tabs=HTTP
          const billingResponse = await client.billingPropertyOperations.get();
          const billingAccountId = billingResponse.billingAccountId; // the variable looks like this "billingAccountId": "/providers/Microsoft.Billing/billingAccounts/00000000-0000-0000-0000-000000000000_00000000-0000-0000-0000-000000000000"

          // if there are no values in the database, we need to retrieve the earliest purchase date of all billing subscriptions, else we make a request from the yesterday date
          const valuesCount = await this.prisma.resourcesCostsValues.count();
          let beginningDate = null;
          if (valuesCount > 0) {
            const yesterday = currentDate;
            yesterday.setDate(currentDate.getDate() - 1);
            beginningDate = formatDate(yesterday);
          } else {
            // Find the earliest purchase date of all billing subscriptions
            // Making a GET request to the /billingSubscriptions endpoint to retrieve the billing subscriptions for the subscription.
            // https://learn.microsoft.com/en-us/rest/api/billing/billing-subscriptions/list-by-billing-account?view=rest-billing-2021-10-01&tabs=HTTP
            const billingSubscriptions = `${this.baseUrl}${billingAccountId}/billingSubscriptions?api-version=2021-10-01`;
            const billingSubscriptionsResponse = await axios.get(
              billingSubscriptions,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );

            let purchaseDate = null;
            for (
              let i = 0;
              i < billingSubscriptionsResponse.data.totalCount;
              i++
            ) {
              if (purchaseDate === null) {
                purchaseDate = new Date(
                  billingSubscriptionsResponse.data.value[
                    i
                  ].properties.purchaseDate,
                );
              } else if (
                new Date(
                  billingSubscriptionsResponse.data.value[
                    i
                  ].properties.purchaseDate,
                ) < new Date(purchaseDate)
              ) {
                purchaseDate = new Date(
                  billingSubscriptionsResponse.data.value[
                    i
                  ].properties.purchaseDate,
                );
              }
            }
            if (purchaseDate !== null) {
              beginningDate = formatDate(purchaseDate);
            }
          }

          const resourcesCostsUrl = `${this.baseUrl}${billingAccountId}/providers/Microsoft.CostManagement/query?api-version=2023-11-01`;

          // The body of the request to the /query endpoint. This specifies the type of data we want to retrieve and the time period.
          const resourcesCostsBody = {
            type: 'ActualCost',
            timeframe: 'Custom',
            timePeriod: {
              from: beginningDate,
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
              grouping: [
                { name: 'ResourceGroup', type: 'Dimension' },
                { name: 'ResourceType', type: 'Dimension' },
              ],
            },
          };

          // Making a POST request to the /query endpoint to retrieve cost data for every ressource of the current subscription and grouping them by resource group and resource type.
          // https://learn.microsoft.com/en-us/rest/api/cost-management/query/usage?view=rest-cost-management-2023-11-01&tabs=HTTP#billingaccountquerygrouping-legacy
          const resourcesCostsResponse = await axios.post(
            resourcesCostsUrl,
            resourcesCostsBody,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          // Making a GET request to the /budgets endpoint to retrieve budget data for the current subscription.
          // https://learn.microsoft.com/en-us/rest/api/consumption/budgets/list?view=rest-consumption-2023-05-01&tabs=HTTP
          const budgetsUrl = `${this.baseUrl}${billingAccountId}/providers/Microsoft.Consumption/budgets?api-version=2023-05-01`;
          const budgetsResponse = await axios.get(budgetsUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // Making a GET request to the /alerts endpoint to retrieve alert data for the current subscription.
          // https://learn.microsoft.com/en-us/rest/api/cost-management/alerts/list?view=rest-cost-management-2023-11-01&tabs=HTTP#billingaccountalerts
          const alertsUrl = `${this.baseUrl}${billingAccountId}/providers/Microsoft.CostManagement/alerts?api-version=2023-11-01`;
          const alertsResponse = await axios.get(alertsUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // Pushing the cost, budget, and alert data to the results array.
          results.push({
            costAndUsage: resourcesCostsResponse.data,
            budgets: budgetsResponse.data,
            alerts: alertsResponse.data,
          });

          // Parse and store data in Prisma models.
          await this.parseAndStoreData(
            resourcesCostsResponse.data,
            budgetsResponse.data,
            alertsResponse.data,
          );
        }
      }
      return results;
    } catch (error) {
      this.logger.error('Error while getting cost data', error.stack);
      throw error;
    }
  }

  /**
   * The convertToDate method converts a string in the format 'YYYYMMDD' to a Date object.
   * @param {string} usageDate - The date string to convert.
   * @returns {Date} A Date object representing the input date string.
   */
  convertToDate(usageDate: string): Date {
    const year = usageDate.slice(0, 4);
    const month = usageDate.slice(4, 6);
    const day = usageDate.slice(6, 8);

    return new Date(`${year}-${month}-${day}`);
  }

  /**
   * The parseAndStoreData method parses and stores the cost, budget, and alert data in the database using Prisma.
   * It first parses and stores the ResourcesCosts data, then the ResourcesCostsValues data, the Budgets data, and the Alerts data.
   * @param {any} resourcesCostsData - The cost and usage data to parse and store.
   * @param {any} budgetsData - The budget data to parse and store.
   * @param {any} alertsData - The alert data to parse and store.
   * @returns {Promise<void>} A Promise that resolves when the data has been parsed and stored.
   */
  async parseAndStoreData(
    resourcesCostsData: any,
    budgetsData: any,
    alertsData: any,
  ): Promise<void> {
    // Parse and store ResourcesCosts data
    const resourcesCosts = await this.prisma.resourcesCosts.upsert({
      where: { id: resourcesCostsData.id },
      update: {
        name: resourcesCostsData.name,
        type: resourcesCostsData.type,
      },
      create: {
        id: resourcesCostsData.id,
        name: resourcesCostsData.name,
        type: resourcesCostsData.type,
      },
    });

    // Upsert ResourcesCostsValues data
    for (const row of resourcesCostsData.properties.rows) {
      const usageDate = this.convertToDate(row[1].toString());
      await this.prisma.resourcesCostsValues.upsert({
        where: {
          usageDate_resourceGroup_resourceType: {
            usageDate: usageDate,
            resourceGroup: row[2],
            resourceType: row[3],
          },
        },
        update: {
          cost: row[0],
          currency: row[4],
          ResourcesCostsId: resourcesCosts.id,
        },
        create: {
          cost: row[0],
          usageDate,
          resourceGroup: row[2],
          resourceType: row[3],
          currency: row[4],
          ResourcesCostsId: resourcesCosts.id,
        },
      });
    }

    // Parse and store Budgets data
    await Promise.all(
      budgetsData.value.map(async (budgetData: any) => {
        return await this.prisma.budget.upsert({
          where: { name: budgetData.name },
          update: {
            id: budgetData.id,
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
          create: {
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
        return await this.prisma.alert.upsert({
          where: { name: alertData.name },
          update: {
            id: alertData.id,
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
          create: {
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

  /**
   * The getAzureMetrics method retrieves cost, budget, and alert data from the database.
   * @returns {Promise<any>} An object containing the cost, budget, and alert data.
   */
  async getAzureMetrics(): Promise<any> {
    const resourcesCosts = await this.prisma.resourcesCosts.findMany({
      include: {
        values: true,
      },
    });

    const budgets = await this.prisma.budget.findMany();

    const alerts = await this.prisma.alert.findMany();

    return {
      resourcesCosts,
      budgets,
      alerts,
    };
  }

  /**
   * Fetches Azure metrics from the database and groups them by resource group.
   * Each group contains an array of objects, each containing the cost, usage date, and currency of a metric.
   *
   * @returns An object where each key is a resource group and the value is an array of metric objects.
   */
  async getAzureMetricsGroupedByResourceGroupAndDate() {
    const metrics = await this.prisma.resourcesCostsValues.findMany({
      select: {
        cost: true,
        usageDate: true,
        currency: true,
        resourceGroup: true,
      },
    });

    const groupedMetrics: {
      [key: string]: { [key: string]: { cost: number; currency: string } };
    } = {};

    metrics.forEach((metric) => {
      const dateKey = metric.usageDate.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD format
      const groupKey = metric.resourceGroup;

      if (!groupedMetrics[groupKey]) {
        groupedMetrics[groupKey] = {};
      }

      if (!groupedMetrics[groupKey][dateKey]) {
        groupedMetrics[groupKey][dateKey] = {
          cost: 0,
          currency: metric.currency,
        };
      }

      groupedMetrics[groupKey][dateKey].cost += metric.cost;
    });

    return groupedMetrics;
  }
  /**
   * Fetches Azure metrics from the database and groups them by resource type.
   * Each group contains an array of objects, each containing the cost, usage date, and currency of a metric.
   *
   * @returns An object where each key is a resource type and the value is an array of metric objects.
   */
  async getAzureMetricsGroupedByResourceTypeAndDate() {
    const metrics = await this.prisma.resourcesCostsValues.findMany({
      select: {
        cost: true,
        usageDate: true,
        currency: true,
        resourceType: true,
      },
    });

    const groupedMetrics: {
      [key: string]: { [key: string]: { cost: number; currency: string } };
    } = {};

    metrics.forEach((metric) => {
      const dateKey = metric.usageDate.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD format
      const typeKey = metric.resourceType;
      if (!groupedMetrics[typeKey]) {
        groupedMetrics[typeKey] = {};
      }
      if (!groupedMetrics[typeKey][dateKey]) {
        groupedMetrics[typeKey][dateKey] = {
          cost: 0,
          currency: metric.currency,
        };
      }

      groupedMetrics[typeKey][dateKey].cost += metric.cost;
    });

    return groupedMetrics;
  }
}
