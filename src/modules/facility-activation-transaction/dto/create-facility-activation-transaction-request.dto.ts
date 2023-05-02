import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { UkefId } from '@ukef/helpers';

export type CreateFacilityActivationTransactionRequest = CreateFacilityActivationTransactionRequestItem[];

export class CreateFacilityActivationTransactionRequestItem {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the facility to activate.',
  })
  readonly facilityIdentifier: UkefId;

  @ValidatedNumberApiProperty({
    description: 'Can be 2 or 3',
    example: 3,
    minimum: 2,
    maximum: 3,
  })
  readonly initialBundleStatusCode: number;

  @ValidatedStringApiProperty({
    description: 'Can be 100 or 500',
    example: '100',
    minLength: 3,
    maxLength: 3,
  })
  readonly lenderTypeCode: string;

  constructor(facilityIdentifier: UkefId, lenderTypeCode: string, initialBundleStatusCode: number) {
    this.facilityIdentifier = facilityIdentifier;
    this.lenderTypeCode = lenderTypeCode;
    this.initialBundleStatusCode = initialBundleStatusCode;
  }
}
