import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { AcbsBundleId } from '@ukef/helpers';

export class CreateFacilityActivationTransactionResponse {
  @ApiProperty({
    readOnly: true,
    minLength: 10,
    maxLength: 10,
    description: 'The identifier of the ACBS bundle.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  readonly bundleIdentifier: AcbsBundleId;

  constructor(bundleIdentifier: AcbsBundleId) {
    this.bundleIdentifier = bundleIdentifier;
  }
}
