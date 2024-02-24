import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HerokuInvoiceApiResponseTypes } from './types';
import { HerokuInvoice, HerokuInvoiceState } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires -- Heroku client is not compatible with ES6 imports
const Heroku = require('heroku-client');

@Injectable()
export class HerokuService {
  private client;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    // Initialize Heroku client with API token from configuration
    this.client = new Heroku({
      token: this.config.get('HEROKU_API_KEY'),
    });
  }

  /**
   * Fetches invoices from Heroku API and saves them in the database
   * @returns Resolves with the created invoices if successful, otherwise throws an InternalServerErrorException
   */
  async create() {
    try {
      // Fetch invoices from Heroku API
      const invoicesHeroku: HerokuInvoiceApiResponseTypes[] =
        await this.client.get('/account/invoices');

      if (!invoicesHeroku) {
        throw new InternalServerErrorException('No invoices found');
      }

      // Transform and create invoices in the database
      const invoicesToCreate: HerokuInvoice[] = invoicesHeroku.map(
        (invoice) => {
          return {
            id: invoice.id,
            chargesTotal: invoice.charges_total,
            creditsTotal: invoice.credits_total,
            periodEnd: new Date(invoice.period_end),
            periodStart: new Date(invoice.period_start),
            state:
              Object.values(HerokuInvoiceState).length > invoice.state
                ? Object.values(HerokuInvoiceState)[invoice.state]
                : HerokuInvoiceState.PENDING,
            createdAt: new Date(invoice.created_at),
            updatedAt: new Date(invoice.updated_at),
          };
        },
      );

      const existingInvoices = await this.prisma.herokuInvoice.findMany();

      // Filter out any invoices that already exist in the database
      const invoicesToCreateFiltered = invoicesToCreate.filter((invoice) => {
        return !existingInvoices.some(
          (existingInvoice) => existingInvoice.id === invoice.id,
        );
      });

      // Filter out any invoices that need to be updated in the database
      const invoicesToUpdateFiltered = invoicesToCreate.filter((invoice) => {
        for (const existingInvoice of existingInvoices) {
          if (existingInvoice.id == invoice.id) {
            if (
              existingInvoice.chargesTotal !== invoice.chargesTotal ||
              existingInvoice.creditsTotal !== invoice.creditsTotal ||
              existingInvoice.periodEnd.toISOString() !==
                invoice.periodEnd.toISOString() ||
              existingInvoice.periodStart.toISOString() !==
                invoice.periodStart.toISOString() ||
              existingInvoice.state !== invoice.state ||
              existingInvoice.createdAt.toISOString() !==
                invoice.createdAt.toISOString() ||
              existingInvoice.updatedAt.toISOString() !==
                invoice.updatedAt.toISOString()
            ) {
              return true;
            }
          }
        }
        return false;
      });

      // Check if there are any new invoices to create or existing invoices to update
      if (
        invoicesToCreateFiltered.length === 0 &&
        invoicesToUpdateFiltered.length === 0
      ) {
        return { message: 'No new invoices found' };
      }

      // Begin a transaction
      const res = await this.prisma.$transaction([
        // Update invoices in the database
        ...invoicesToUpdateFiltered.map((invoice) => {
          return this.prisma.herokuInvoice.update({
            where: {
              id: invoice.id,
            },
            data: {
              chargesTotal: invoice.chargesTotal,
              creditsTotal: invoice.creditsTotal,
              periodEnd: invoice.periodEnd,
              periodStart: invoice.periodStart,
              state: invoice.state,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
            },
          });
        }),
        // Create invoices in the database
        ...invoicesToCreateFiltered.map((invoice) => {
          return this.prisma.herokuInvoice.create({
            data: {
              id: invoice.id,
              chargesTotal: invoice.chargesTotal,
              creditsTotal: invoice.creditsTotal,
              periodEnd: invoice.periodEnd,
              periodStart: invoice.periodStart,
              state: invoice.state,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
            },
          });
        }),
      ]);

      // Check if the transaction was successful
      if (
        !res ||
        res.length !==
          invoicesToCreateFiltered.length + invoicesToUpdateFiltered.length
      ) {
        throw new InternalServerErrorException('Error creating invoices');
      }

      // Generate a message based on the invoices to create and update
      const message = this.generateMessage(
        ['create', 'update'],
        [invoicesToCreateFiltered, invoicesToUpdateFiltered],
      );

      return { message };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * Fetches all invoices from the database
   * @returns Resolves with an array of invoices if found, otherwise throws an InternalServerErrorException
   */
  async findAll() {
    // Fetch all invoices from the database
    const invoices = await this.prisma.herokuInvoice.findMany();

    // Check if invoices were found
    if (!invoices) {
      throw new InternalServerErrorException('No invoices found');
    }

    return invoices;
  }

  /**
   * Fetches a specific invoice by ID from the database
   * @param id - The ID of the invoice to fetch
   * @returns Resolves with the invoice if found, otherwise throws a NotFoundException
   */
  async findOne(id: string) {
    // Fetch invoice by ID from the database
    const invoice = await this.prisma.herokuInvoice.findUnique({
      where: {
        id: id,
      },
    });

    // Check if invoice was found
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Generates a message based on arrays of invoices to create or update or delete in the database
   * @param actions - An array of actions to perform on the invoices (create, update, delete)
   * @param arrays - An array of invoices to perform the actions on (HerokuInvoice[][])
   * @returns A message based on the invoices to create or update or delete
   */
  generateMessage = (actions: string[], arrays: HerokuInvoice[][]) => {
    let message = '';

    // Determine the minimum length between actions and arrays
    const minLength = Math.min(actions.length, arrays.length);

    // Iterate over each action and corresponding array up to the minimum length
    for (let i = 0; i < minLength; i++) {
      const action = actions[i];
      const array = arrays[i];

      // Check if there are items in the array
      if (array.length > 0) {
        // Determine the verb based on the action type
        let verb = '';
        switch (action) {
          case 'create':
            verb = array.length > 1 ? 'Created' : 'Create';
            break;
          case 'update':
            verb = array.length > 1 ? 'Updated' : 'Update';
            break;
          case 'delete':
            verb = array.length > 1 ? 'Deleted' : 'Delete';
            break;
          default:
            verb = 'Processed';
        }

        // Capitalize the first letter of the verb if it's not the first action
        if (message !== '') {
          verb = verb.charAt(0).toLowerCase() + verb.slice(1);
        }

        // Determine the pluralization of the item
        const itemPlural = array.length > 1 ? `invoices` : `invoice`;

        // Construct the message
        if (message !== '') {
          message += ' and ';
        }
        message += `${verb} ${array.length} ${itemPlural}`;
      }
    }

    // Return the generated message
    return message;
  };
}
