import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateFacilityFixedFeeResponse {
  @ApiProperty({
    description: 'The identifier of the facility in ACBS for which the fixed fee has been created. This will be a 10-digit code.',
    example: EXAMPLES.FACILITY_ID,
  })
  readonly facilityIdentifier: string;

  constructor(facilityIdentifier: string) {
    this.facilityIdentifier = facilityIdentifier;
  }
}
