import { ValidatedBundleIdentifierApiProperty } from '@ukef/decorators/validated-bundle-identifier-api-property.decorator';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';

export class GetLoanTransactionParamsDto {
  @ValidatedFacilityIdentifierApiProperty({ description: 'The UKEF identifier for the facility.' })
  readonly facilityIdentifier: string;

  @ValidatedBundleIdentifierApiProperty({ description: 'The bundle identifier for the loan transaction.' })
  readonly bundleIdentifier: string;
}
