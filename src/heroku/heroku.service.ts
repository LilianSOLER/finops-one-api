import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HerokuInvoiceApiResponseTypes } from './types';
import { HerokuInvoice, HerokuInvoiceState } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Heroku = require('heroku-client');

@Injectable()
export class HerokuService {
  private client;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.client = new Heroku({
      token: this.config.get('HEROKU_API_KEY'),
    });
  }

  async create() {
    try {
      const invoicesHeroku: HerokuInvoiceApiResponseTypes[] =
        await this.client.get('/account/invoices');

      const invoicesToCreate: HerokuInvoice[] = invoicesHeroku.map(
        (invoice) => {
          return {
            id: invoice.id,
            chargesTotal: invoice.charges_total,
            creditsTotal: invoice.credits_total,
            periodEnd: new Date(invoice.period_end),
            periodStart: new Date(invoice.period_start),
            state:
              Object.values(HerokuInvoiceState).length < invoice.state
                ? Object.values(HerokuInvoiceState)[invoice.state]
                : HerokuInvoiceState.PENDING,
            createdAt: new Date(invoice.created_at),
            updatedAt: new Date(invoice.updated_at),
          };
        },
      );

      const res = await this.prisma.herokuInvoice.createMany({
        data: invoicesToCreate,
      });

      if (res.count > 0) {
        return res;
      } else {
        throw new InternalServerErrorException('No invoices were created');
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  findAll() {
    const invoices = this.prisma.herokuInvoice.findMany();

    if (!invoices) {
      return new InternalServerErrorException('No invoices found');
    }

    return invoices;
  }

  async findOne(id: string) {
    const invoices = await this.prisma.herokuInvoice.findUnique({
      where: {
        id: id,
      },
    });

    if (!invoices) {
      return new InternalServerErrorException('No invoices found');
    }

    return invoices;
  }
}
