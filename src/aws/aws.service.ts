import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Response,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { CredentialDto } from './dto/credential.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Metric, MetricGroupeBy } from './types';
import { RemoveCredentialDto } from './dto/rm-credential.dto';

const credentials = {
  access_key: 'AKIA5FTZCBQ6TH57OP4P',
  secret_key: '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',
};
function calculateYesterday(date: Date) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

@Injectable({})
export class AwsService {
  //private ce = new AWS.CostExplorer();
  constructor(private prismaService: PrismaService) {
    AWS.config.update({
      accessKeyId: credentials.access_key,
      secretAccessKey: credentials.secret_key,
      region: 'eu-west-3',
    });
  }

  async getCost() {
    //retrieve and update aws credentials and set it depending on which project belong the user
    //TODO : add a loop that does this for every existing projects
    //TODO : add the code that update the access for the current project
    //set the query (date)
    // const ssm = new AWS.SSM({
    //   accessKeyId: credentials.access_key,
    //   secretAccessKey: credentials.secret_key,
    //   region: 'eu-west-3',
    // });
    const ce = new AWS.CostExplorer(); // obligé de le mettre ici sinon ça marche pas
    const today = new Date();
    const yesterday = calculateYesterday(today);

    const params = {
      TimePeriod: {
        Start: yesterday.toISOString().split('T')[0],
        End: today.toISOString().split('T')[0],
      },

      Granularity: 'DAILY',
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
      Metrics: [
        'BLENDED_COST',
        'USAGE_QUANTITY',
        'AMORTIZED_COST',
        'NET_AMORTIZED_COST',
        'NET_UNBLENDED_COST',
        'NORMALIZED_USAGE_AMOUNT',
        'UNBLENDED_COST',
      ],
    };
    const data = ce.getCostAndUsage(
      params,
      (err: Error | null, data: AWS.CostExplorer.GetCostAndUsageResponse) => {
        if (err) {
          console.error(err, err.stack);
        } else {
          return data;
        }
      },
    );
    // from promise exxtract and store the date in DB
    const res = await data.promise();
    if (!res.ResultsByTime) {
      throw new InternalServerErrorException(
        'error while fetching data from aws service',
      );
    }
    const metrics: Metric[] = [];
    for (let i = 0; i < res.ResultsByTime.length; i++) {
      let index = res.ResultsByTime.at(i);
      if (index?.TimePeriod) {
        /*la seconde valeur dans la bdd est le service
                il y a souvent plusieurs on les traites donc comme des instances différentes
                */
        let curr_time_period = new Date(index.TimePeriod.Start);
        if (index?.Groups) {
          for (let i = 0; i < index?.Groups?.length; i++) {
            const metric: Metric = {
              timePeriod: new Date(),
              service: '',
              amortizedCost: 0,
              blendedCost: 0,
              netAmortizedCost: 0,
              unblendedCost: 0,
              netUnblendedCost: 0,
              usageQuantity: 0,
              normalizedUsageAmount: 0,
            };

            if (curr_time_period) {
              metric.timePeriod = curr_time_period;
            }

            const curr_service = index.Groups.at(i)?.Keys?.at(0);
            if (curr_service) {
              metric.service = curr_service;
            }

            const curr_amort_cost = index.Groups.at(i)?.Metrics?.AmortizedCost;
            if (curr_amort_cost?.Amount) {
              metric.amortizedCost = parseFloat(curr_amort_cost.Amount);
            }
            const curr_blended_cost = index.Groups.at(i)?.Metrics?.BlendedCost;
            if (curr_blended_cost?.Amount) {
              metric.blendedCost = parseFloat(curr_blended_cost.Amount);
            }

            const curr_net_amort_cost =
              index.Groups.at(i)?.Metrics?.NetAmortizedCost;
            if (curr_net_amort_cost?.Amount) {
              metric.netAmortizedCost = parseFloat(curr_net_amort_cost.Amount);
            }

            const curr_unblend_cost =
              index.Groups.at(i)?.Metrics?.UnblendedCost;
            if (curr_unblend_cost?.Amount) {
              metric.unblendedCost = parseFloat(curr_unblend_cost.Amount);
            }

            let curr_norm_usg_cost =
              index.Groups.at(i)?.Metrics?.NormalizedUsageAmount;
            if (curr_norm_usg_cost?.Amount) {
              metric.normalizedUsageAmount = parseInt(
                curr_norm_usg_cost.Amount,
              );
            }

            let curr_usg_qty = index.Groups.at(i)?.Metrics?.UsageQuantity;
            if (curr_usg_qty?.Amount) {
              metric.usageQuantity = parseInt(curr_usg_qty.Amount);
            }

            metrics.push(metric);
          }
        }
      }
    }

    // add in the database
    // for (let i = 0; i < metrics.length; i++) {
    //   const metric = await this.prismaService.awsMetrics.create({
    //     data: {
    //       timePeriod: metrics[i].timePeriod.toISOString(),
    //       service: metrics[i].service,
    //       amortizedCost: metrics[i].amortizedCost,
    //       blendedCost: metrics[i].blendedCost,
    //       netAmortizedCost: metrics[i].netAmortizedCost,
    //       unblendedCost: metrics[i].unblendedCost,
    //       netUnblendedCost: metrics[i].netUnblendedCost,
    //       usageQuantity: metrics[i].usageQuantity,
    //       normalizedUsageAmount: metrics[i].normalizedUsageAmount,
    //     },
    //   });
    // }
    metrics.map((metric) => {
      return {
        ...metric,
        timePeriod: metric.timePeriod.toISOString(),
      };
    });

    await this.prismaService.awsMetrics.createMany({
      data: metrics,
    });

    return metrics;
  }

  //Doit être seulement accèssible pour le role admin de projet
  async addCredentials(dto: CredentialDto) {
    const date = new Date();

    try {
      const res = await this.prismaService.awsCredentials.create({
        data: {
          createdAt : new Date().toISOString(),
          accessKeyId: dto.accessKeyId,
          secretAccessKey: dto.secretAccessKey,
        },
      });


      if (res) {
        return res;
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('this access key already exist in DB');
        }
      }
      throw err;
    }
  }

  //TODO : set access control

  async getCredentials() {
    const res = await this.prismaService.awsCredentials.findMany();
    if (res) {
      return res;
    }
  }

  async getMetrics() {
    return await this.prismaService.awsMetrics.findMany({
      select: {
        service: true,
        amortizedCost: true,
        timePeriod: true,
        blendedCost: true,
        netUnblendedCost: true,
        netAmortizedCost: true,
        normalizedUsageAmount: true,
      },
    });
  }

  async getCostServices() {
    const res = await this.prismaService.awsMetrics.groupBy({
      by: ['service'],
      _sum: {
        blendedCost: true,
      },
    });

    let tmp: MetricGroupeBy[] = [];
    res.forEach((item) => {
      let coutGroup: MetricGroupeBy = { cost: 0, service: undefined };
      let cout = item._sum.blendedCost;
      let service = item.service;
      if (cout && service) {
        coutGroup.cost = cout;
        coutGroup.service = service;
        tmp.push(coutGroup);
      }
    });
    return tmp;
  }

  async updateCredentials(credDto: CredentialDto) {
    const cred = await this.prismaService.awsCredentials.findUnique({
      where: {
        accessKeyId: credDto.accessKeyId,
      },
    });

    if (!cred) {
      throw new NotFoundException('this credential was not found');
    }

    return await this.prismaService.awsCredentials.update({
      where: {
        accessKeyId: credDto.accessKeyId,
      },
      data: {
        accessKeyId: credDto.accessKeyId,
        secretAccessKey: credDto.secretAccessKey,
      },
    });
  }

  async removeCredential(credDto: RemoveCredentialDto) {
    return await this.prismaService.awsCredentials.delete({
      where: {
        accessKeyId: credDto.accessKeyId,
      },
    });
  }
}
