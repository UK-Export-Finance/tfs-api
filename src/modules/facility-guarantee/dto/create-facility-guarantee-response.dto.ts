import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateOrUpdateFacilityGuaranteeResponse {
  @ApiResponseProperty({ example: EXAMPLES.FACILITY_ID })
  readonly facilityIdentifier: string;

  constructor(facilityIdentifier: string) {
    this.facilityIdentifier = facilityIdentifier;
  }
}
