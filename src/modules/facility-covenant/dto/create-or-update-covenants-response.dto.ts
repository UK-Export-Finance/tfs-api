import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateOrUpdateFacilityCovenantsResponseDto {
  @ApiProperty({
    description: 'The identifier of the facility in ACBS for which the covenant(s) have been created/updated. This will be a 10-digit code.',
    example: EXAMPLES.FACILITY_ID,
  })
  readonly facilityIdentifier: string;

  constructor(facilityIdentifier: string) {
    this.facilityIdentifier = facilityIdentifier;
  }
}
