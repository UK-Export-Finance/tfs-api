import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateFacilityResponse {
  @ApiProperty({
    description: 'The identifier of the created facility.',
    example: EXAMPLES.FACILITY_ID,
  })
  facilityIdentifier: string;
}
