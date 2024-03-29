import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { AcbsBundleId } from '@ukef/helpers';

export class CreateFixedFeeAmountAmendmentResponse {
  @ApiProperty({
    description: 'The identifier of the ACBS bundle.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  readonly bundleIdentifier: AcbsBundleId;

  constructor(bundleIdentifier: AcbsBundleId) {
    this.bundleIdentifier = bundleIdentifier;
  }
}
