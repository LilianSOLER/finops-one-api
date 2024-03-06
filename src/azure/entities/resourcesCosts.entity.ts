import { ApiProperty } from '@nestjs/swagger';
import { ResourcesCosts, ResourcesCostsValues } from '@prisma/client';
import { ResourcesCostsValuesEntity } from './resourcesCostsValues.entity';

export class ResourcesCostsEntity implements ResourcesCosts {
  @ApiProperty({
    description: 'The unique identifier for the resource',
    type: String,
  })
  id: string;

  @ApiProperty({ description: 'The name of the resource', type: String })
  name: string;

  @ApiProperty({ description: 'The type of the resource', type: String })
  type: string;

  @ApiProperty({
    description: 'The values of the resource costs',
    type: () => [ResourcesCostsValuesEntity],
  })
  values: ResourcesCostsValues[];
}
