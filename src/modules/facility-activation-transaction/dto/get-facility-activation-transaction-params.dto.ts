import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class GetFacilityActivationTransactionParamsDto {
  @ValidatedStringApiProperty({ description: 'The UKEF identifier for the facility.', length: 10, pattern: /^00\d{8}$/ })
  readonly facilityIdentifier: string;

  @ValidatedStringApiProperty({ description: 'The bundle identifier for the loan transaction.', length: 10, pattern: /^0{4}\d{6}$/ })
  readonly bundleIdentifier: string;
}
