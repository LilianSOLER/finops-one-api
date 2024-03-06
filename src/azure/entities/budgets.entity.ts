import { ApiProperty } from '@nestjs/swagger';
import { Budgets } from '@prisma/client';

export class BudgetEntity implements Budgets {
  @ApiProperty({
    description: 'The unique identifier for the budget',
    type: String,
  })
  id: string;

  @ApiProperty({ description: 'The name of the budget', type: String })
  name: string;

  @ApiProperty({ description: 'The type of the budget', type: String })
  type: string;

  @ApiProperty({
    description: 'The eTag of the budget',
    type: String,
    required: false,
  })
  eTag: string | null;

  @ApiProperty({ description: 'The start date of the budget', type: Date })
  startDate: Date;

  @ApiProperty({ description: 'The end date of the budget', type: Date })
  endDate: Date;

  @ApiProperty({ description: 'The time grain of the budget', type: String })
  timeGrain: string;

  @ApiProperty({ description: 'The amount of the budget', type: Number })
  amount: number;

  @ApiProperty({ description: 'The current spend of the budget', type: Number })
  currentSpend: number;

  @ApiProperty({ description: 'The unit of the budget', type: String })
  unit: string;

  @ApiProperty({ description: 'The category of the budget', type: String })
  category: string;
}
