import { ApiProperty } from '@nestjs/swagger';
import { Alerts } from '@prisma/client';

export class AlertEntity implements Alerts {
  @ApiProperty({
    description: 'The unique identifier for the alert',
    type: String,
  })
  id: string;

  @ApiProperty({ description: 'The name of the alert', type: String })
  name: string;

  @ApiProperty({ description: 'The type of the alert', type: String })
  type: string;

  @ApiProperty({ description: 'The type of the alert', type: String })
  alertType: string;

  @ApiProperty({ description: 'The category of the alert', type: String })
  alertCategory: string;

  @ApiProperty({ description: 'The criteria of the alert', type: String })
  alertCriteria: string;

  @ApiProperty({ description: 'The description of the alert', type: String })
  description: string;

  @ApiProperty({ description: 'The source of the alert', type: String })
  source: string;

  @ApiProperty({
    description: 'The time grain type of the alert',
    type: String,
  })
  timeGrainType: string;

  @ApiProperty({ description: 'The start date of the period', type: Date })
  periodStartDate: Date;

  @ApiProperty({ description: 'The trigger of the alert', type: String })
  triggeredBy: string;

  @ApiProperty({ description: 'The threshold of the alert', type: Number })
  threshold: number;

  @ApiProperty({ description: 'The operator of the alert', type: String })
  operator: string;

  @ApiProperty({ description: 'The amount of the alert', type: Number })
  amount: number;

  @ApiProperty({ description: 'The unit of the alert', type: String })
  unit: string;

  @ApiProperty({ description: 'The current spend of the alert', type: Number })
  currentSpend: number;

  @ApiProperty({ description: 'The ID of the cost entity', type: String })
  costEntityId: string;

  @ApiProperty({ description: 'The status of the alert', type: String })
  status: string;

  @ApiProperty({ description: 'The creation time of the alert', type: Date })
  creationTime: Date;

  @ApiProperty({ description: 'The close time of the alert', type: Date })
  closeTime: Date;

  @ApiProperty({
    description: 'The modification time of the alert',
    type: Date,
  })
  modificationTime: Date;

  @ApiProperty({
    description: 'The status modification time of the alert',
    type: Date,
  })
  statusModificationTime: Date;
}
