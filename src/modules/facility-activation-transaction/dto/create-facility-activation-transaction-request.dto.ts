import { ENUMS } from '@ukef/constants';
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
    description: 'In most situations the value should be 3, it means auto approval.',
    example: ENUMS.BUNDLE_STATUSES.SUBMIT_FOR_POSTING,
    enum: ENUMS.BUNDLE_STATUSES,
  })
  readonly initialBundleStatusCode: number;

  @ValidatedStringApiProperty({
    description: 'In most situations the value should be 100, it means first level obligor.',
    example: ENUMS.LENDER_TYPE_CODES.FIRST_LEVEL_OBLIGOR,
    length: 3,
    enum: ENUMS.LENDER_TYPE_CODES,
  })
  readonly lenderTypeCode: string;

  constructor(facilityIdentifier: UkefId, lenderTypeCode: string, initialBundleStatusCode: number) {
    this.facilityIdentifier = facilityIdentifier;
    this.lenderTypeCode = lenderTypeCode;
    this.initialBundleStatusCode = initialBundleStatusCode;
  }
}
