import { HerokuInvoice, HerokuInvoiceState } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class HerokuEntity implements HerokuInvoice {
  @ApiProperty({
    type: 'number',
    description: 'The total charges for the invoice in cents',
  })
  chargesTotal: number;

  @ApiProperty({
    type: 'number',
    description: 'The total credits for the invoice in cents',
  })
  creditsTotal: number;

  @ApiProperty({
    type: 'uuid',
    description: 'The unique identifier for the invoice',
  })
  id: string;

  @ApiProperty({
    type: 'date',
    description: 'The end of the period the invoice covers',
  })
  periodEnd: Date;

  @ApiProperty({
    type: 'date',
    description: 'The start of the period the invoice covers',
  })
  periodStart: Date;

  @ApiProperty({
    type: HerokuInvoiceState,
    description: 'The state of the invoice',
  })
  state: HerokuInvoiceState;

  @ApiProperty({
    type: 'date',
    description: 'The date the invoice was created',
  })
  createdAt: Date;

  @ApiProperty({
    type: 'date',
    description: 'The date the invoice was last updated',
  })
  updatedAt: Date;
}
