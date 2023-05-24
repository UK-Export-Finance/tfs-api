import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class GetLoanTransactionParamsDto {
  @ValidatedStringApiProperty({ description: 'The UKEF identifier for the facility.', length: 10, pattern: /^00\d{8}$/ })
  readonly facilityIdentifier: string;

  @ValidatedStringApiProperty({ description: 'The bundle identifier for the loan transaction.', length: 10, pattern: /^\d{10}$/ })
  readonly bundleIdentifier: string;
}
