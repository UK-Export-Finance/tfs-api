import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateOrUpdateFacilityCovenantsResponseDto {
  @ApiProperty({
    description: 'The identifier of the facility in ACBS for which the covenant(s) has been created/updated.',
    example: EXAMPLES.FACILITY_ID,
  })
  readonly facilityIdentifier: string;

  constructor(facilityIdentifier: string) {
    this.facilityIdentifier = facilityIdentifier;
  }
}
