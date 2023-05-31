import { ENUMS } from '@ukef/constants';
import { OperationTypeCodeEnum } from '@ukef/constants/enums/operation-type-code';
import { ProductTypeGroupEnum } from '@ukef/constants/enums/product-type-group';
import { ProductTypeIdEnum } from '@ukef/constants/enums/product-type-id';
import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedPartyIdentifierApiProperty } from '@ukef/decorators/validated-party-identifier-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export type CreateFacilityLoanRequest = CreateFacilityLoanRequestItem[];

export class CreateFacilityLoanRequestItem {
  @ValidatedDateOnlyApiProperty({
    description: 'The date of the action.',
  })
  readonly postingDate: DateOnlyString;

  @ValidatedPartyIdentifierApiProperty({
    description: 'The customer identifier representing the borrower for the loan.',
  })
  readonly borrowerPartyIdentifier: string;

  @ValidatedStringApiProperty({
    description: `The product type identifier for the loan: 250 for BSS, 260 for EWCS, 280 for GEF-Cash, 281 for GEF-Contingent. It is called the product type code in ACBS.`,
    example: ENUMS.PRODUCT_TYPE_IDS.BSS,
    enum: ENUMS.PRODUCT_TYPE_IDS,
  })
  readonly productTypeId: ProductTypeIdEnum;

  @ValidatedStringApiProperty({
    description: `The product type group identifier for the loan: EW for EWCS, BS for Bond, GM for GEF. It is called the product group code in ACBS.`,
    example: ENUMS.PRODUCT_TYPE_GROUPS.BOND,
    enum: ENUMS.PRODUCT_TYPE_GROUPS,
  })
  readonly productTypeGroup: ProductTypeGroupEnum;

  @ValidatedCurrencyApiProperty({
    description: 'The currency code of the primary currency of the loan, from the Currency Definition Table.',
  })
  readonly currency: string;

  @ValidatedNumberApiProperty({
    description: 'The exchange rate between the loan currency and the deal currency. Required when loan currency differs from deal currency.',
    required: false,
  })
  readonly dealCustomerUsageRate?: number;

  @ValidatedStringApiProperty({
    description: `Represents the currency exchange rate operand (M-multiply or D-divide). Required when loan currency differs from deal currency.`,
    example: ENUMS.OPERATION_TYPE_CODES.MULTIPLY,
    enum: ENUMS.OPERATION_TYPE_CODES,
    required: false,
  })
  readonly dealCustomerUsageOperationType?: OperationTypeCodeEnum;

  @ValidatedNumberApiProperty({
    description: 'The amount of the loan.',
    minimum: 0,
  })
  readonly amount: number;

  @ValidatedDateOnlyApiProperty({
    description: 'The facility issue date.',
  })
  readonly issueDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The facility expiry date.',
  })
  readonly expiryDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The next payment due date of the repayment schedule & date the next rate will be set for accrual schedules.',
  })
  readonly nextDueDate: DateOnlyString;

  @ValidatedNumberApiProperty({
    description: 'The guarantee fee percentage.',
    minimum: 0,
  })
  readonly spreadRate: number;

  @ValidatedNumberApiProperty({
    description: 'The corresponding fee rate. If null interest rate will be used.',
    minimum: 0,
    required: false,
  })
  readonly spreadRateCtl: number;

  @ValidatedStringApiProperty({
    description: 'The year basis for the accrual schedule.',
  })
  readonly yearBasis: string;

  @ValidatedStringApiProperty({
    description: 'The frequency which the rate will change.',
    required: false,
  })
  readonly indexRateChangeFrequency: string;
}
