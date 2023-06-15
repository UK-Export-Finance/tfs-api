import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type CreateFacilityInvestorRequest = CreateFacilityInvestorRequestItem[];

export class CreateFacilityInvestorRequestItem {
  @ValidatedDateOnlyApiProperty({
    description: `The date from which this limit is effective.`,
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: `The date on which this limit will expire.`,
  })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ValidatedCurrencyApiProperty({
    description: 'The code of the currency for this investor, Currency in the Currency Definition Table.',
  })
  readonly currency: string;

  @ValidatedNumberApiProperty({
    description: `The investor's share of the current limit amount.`,
    minimum: 0,
  })
  readonly maximumLiability: number;

  @ValidatedStringApiProperty({
    description: 'The lender type for this investor, Key Value 1 from the T1300 - Lender Type Code Table.',
    enum: ENUMS.LENDER_TYPE_CODES,
    example: EXAMPLES.LENDER_TYPE_CODE,
    required: false,
    default: PROPERTIES.FACILITY_INVESTOR.DEFAULT.lenderType.lenderTypeCode,
  })
  readonly lenderType?: LenderTypeCodeEnum;

  constructor(effectiveDate: DateOnlyString, guaranteeExpiryDate: DateOnlyString, currency: string, maximumLiability: number, lenderType?: LenderTypeCodeEnum) {
    this.effectiveDate = effectiveDate;
    this.guaranteeExpiryDate = guaranteeExpiryDate;
    this.currency = currency;
    this.maximumLiability = maximumLiability;
    this.lenderType = lenderType;
  }
}
