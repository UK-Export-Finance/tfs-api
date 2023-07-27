import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { AcbsBundleId } from '@ukef/helpers';

export class CreateFacilityActivationTransactionResponse {
  @ApiProperty({
    minLength: 10,
    maxLength: 10,
    description: 'The identifier of the ACBS bundle.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  readonly bundleIdentifier: AcbsBundleId;
  readonly warningErrors: string;

  constructor(bundleIdentifier: AcbsBundleId, warningErrors: string) {
    this.bundleIdentifier = bundleIdentifier;
    this.warningErrors = warningErrors;
  }
}
