import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { ValidatedBooleanApiProperty } from '@ukef/decorators/validated-boolean-api-property.decorator';
import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export type CreateFacilityFixedFeeRequest = CreateFacilityFixedFeeRequestItem[];
export class CreateFacilityFixedFeeRequestItem {
  @ValidatedNumberApiProperty({
    description: 'The fixed amount to be billed to the client. If a flat amount is charged, this field is required.',
    example: EXAMPLES.DEAL_OR_FACILITY_VALUE,
    minimum: 0,
  })
  readonly amount: number;

  @ValidatedDateOnlyApiProperty({
    description: 'The effective date of this accruing/fixed fee schedule.',
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The expiration date of this accruing/fixed fee schedule.',
  })
  readonly expirationDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'Date the next fee bill is due for this fee schedule.',
  })
  readonly nextDueDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'End date for the current accrual period. This date can be different than the Next Due Date.',
  })
  readonly nextAccrueToDate: DateOnlyString;

  @ValidatedStringApiProperty({
    description: 'Segment identifier from income exposure table. 2 alphanumeric characters.',
    length: 2,
  })
  readonly period: string;

  @ValidatedCurrencyApiProperty({
    description:
      'The currency of Facility Fee, defined in the Currency Definition Table under Systems Administration of Servicing. For example, USD for United States Dollar.',
  })
  readonly currency: string;

  @ValidatedStringApiProperty({
    description: 'Defines the code for the role of the party in the Facility for which the fee is created.',
    enum: LenderTypeCodeEnum,
    example: ENUMS.LENDER_TYPE_CODES.ECGD,
  })
  readonly lenderTypeCode: string;

  @ValidatedStringApiProperty({
    description: 'Defines the code for the fee type of this schedule for reporting and GL purposes.',
    example: ENUMS.INCOME_CLASS_CODES.BPM,
    enum: ENUMS.INCOME_CLASS_CODES,
    default: PROPERTIES.FACILITY_FIXED_FEE.DEFAULT.incomeClassCode,
    required: false,
  })
  readonly incomeClassCode?: string;

  @ValidatedBooleanApiProperty({
    description:
      'Action indicator to be supplied together with the Fee to control propagation of the fee effects to other investors. Not applicable to output data.',
  })
  readonly spreadToInvestorsIndicator: boolean;

  constructor(
    amount: number,
    effectiveDate: DateOnlyString,
    expirationDate: DateOnlyString,
    nextDueDate: DateOnlyString,
    nextAccrueToDate: DateOnlyString,
    period: string,
    currency: string,
    lenderTypeCode: string,
    incomeClassCode: string,
    spreadToInvestorsIndicator: boolean,
  ) {
    this.amount = amount;
    this.effectiveDate = effectiveDate;
    this.expirationDate = expirationDate;
    this.nextDueDate = nextDueDate;
    this.nextAccrueToDate = nextAccrueToDate;
    this.period = period;
    this.currency = currency;
    this.lenderTypeCode = lenderTypeCode;
    this.incomeClassCode = incomeClassCode;
    this.spreadToInvestorsIndicator = spreadToInvestorsIndicator;
  }
}
