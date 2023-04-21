import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateFacilityResponse {
  @ApiProperty({
    description: 'The identifier of the created facility.',
    readOnly: true,
    example: EXAMPLES.FACILITY_ID,
  })
  readonly facilityIdentifier: string;
}
