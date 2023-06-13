import { ENUMS } from '@ukef/constants';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type CreateFacilityActivationTransactionRequest = CreateFacilityActivationTransactionRequestItem[];

export class CreateFacilityActivationTransactionRequestItem {
  @ValidatedNumberApiProperty({
    description: 'In most situations the value should be 3, it means auto approval.',
    example: ENUMS.INITIAL_BUNDLE_STATUS_CODES.SUBMIT_FOR_POSTING,
    enum: ENUMS.INITIAL_BUNDLE_STATUS_CODES,
  })
  readonly initialBundleStatusCode: number;

  @ValidatedStringApiProperty({
    description: 'In most situations the value should be 100, it means first level obligor.',
    example: ENUMS.LENDER_TYPE_CODES.FIRST_LEVEL_OBLIGOR,
    length: 3,
    enum: ENUMS.LENDER_TYPE_CODES,
  })
  readonly lenderTypeCode: string;

  constructor(lenderTypeCode: string, initialBundleStatusCode: number) {
    this.lenderTypeCode = lenderTypeCode;
    this.initialBundleStatusCode = initialBundleStatusCode;
  }
}
