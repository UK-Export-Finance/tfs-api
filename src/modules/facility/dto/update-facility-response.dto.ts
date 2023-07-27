import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { AcbsBundleId, UkefId } from '@ukef/helpers';

export class UpdateFacilityFacilityIdentifierResponse {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the updated facility.',
  })
  readonly facilityIdentifier: UkefId;
}

export class UpdateFacilityBundleIdentifierResponse {
  @ApiProperty({
    description: 'The ID of the created loan amendment bundle.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  readonly bundleIdentifier: AcbsBundleId;
  readonly warningErrors: string;
}
