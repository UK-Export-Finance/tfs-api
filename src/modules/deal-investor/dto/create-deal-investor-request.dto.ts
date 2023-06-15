import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateString } from '@ukef/helpers';

export type CreateDealInvestorRequest = CreateDealInvestorRequestItem[];

export class CreateDealInvestorRequestItem {
  @ValidatedStringApiProperty({
    description: 'The lender type code for the investor party of the deal.',
    enum: ENUMS.LENDER_TYPE_CODES,
    example: EXAMPLES.LENDER_TYPE_CODE,
    required: false,
    default: PROPERTIES.DEAL_INVESTOR.DEFAULT.lenderType.lenderTypeCode,
  })
  readonly lenderType?: LenderTypeCodeEnum;

  @ValidatedDateOnlyApiProperty({
    description: "The effective date on the deal investor record. If the date provided is in the future, it will be replaced by today's date.",
    example: '2023-03-24',
  })
  readonly effectiveDate: DateString;

  @ValidatedDateOnlyApiProperty({
    description: 'The expiry date on the deal investor record. If the value is not provided or is null then the maximum expiry date will be set.',
    example: '2023-03-24',
    required: false,
    nullable: true,
    default: null,
  })
  readonly expiryDate?: DateString | null;

  @ValidatedStringApiProperty({
    description: "A code for the status of the deal on which the sub-limit is created, e.g., 'A' for 'ACTIVE/PENDING', 'B' for 'ACTIVE' etc.",
    example: 'A',
    minLength: 0,
    maxLength: 1,
    required: false,
    default: 'A',
  })
  readonly dealStatus?: string;

  @ValidatedCurrencyApiProperty({
    description: 'The deal currency code.',
  })
  readonly currency: string;
}
