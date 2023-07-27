import { EXAMPLES, UKEFID } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { AcbsBundleId } from '@ukef/helpers';

export class CreateFacilityLoanResponse {
  @ValidatedStringApiProperty({
    length: 10,
    description: 'The identifier of the ACBS bundle.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
    pattern: UKEFID.BUNDLE_ID.REGEX,
  })
  readonly bundleIdentifier: AcbsBundleId;
  readonly warningErrors: string;

  constructor(bundleIdentifier: AcbsBundleId, warningErrors: string) {
    this.bundleIdentifier = bundleIdentifier;
    this.warningErrors = warningErrors;
  }
}
