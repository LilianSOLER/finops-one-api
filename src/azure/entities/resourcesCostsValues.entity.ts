import { ApiProperty } from '@nestjs/swagger';
import { ResourcesCosts, ResourcesCostsValues } from '@prisma/client';
import { ResourcesCostsEntity } from './resourcesCosts.entity';

export class ResourcesCostsValuesEntity implements ResourcesCostsValues {
  @ApiProperty({ description: 'The cost of the resource', type: Number })
  cost: number;

  @ApiProperty({ description: 'The date of usage', type: Date })
  usageDate: Date;

  @ApiProperty({ description: 'The group of the resource', type: String })
  resourceGroup: string;

  @ApiProperty({ description: 'The type of the resource', type: String })
  resourceType: string;

  @ApiProperty({ description: 'The currency of the cost', type: String })
  currency: string;

  @ApiProperty({
    description: 'The related resource entity',
    type: () => ResourcesCostsEntity,
  })
  ResourcesCosts: ResourcesCosts;

  @ApiProperty({
    description: 'The ID of the related resource entity',
    type: String,
  })
  ResourcesCostsId: string;
}
