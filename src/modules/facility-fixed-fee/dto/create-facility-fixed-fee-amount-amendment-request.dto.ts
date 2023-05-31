import { ENUMS } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedPartyIdentifierApiProperty } from '@ukef/decorators/validated-party-identifier-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { AcbsPartyId, DateOnlyString } from '@ukef/helpers';

export type CreateFixedFeeAmountAmendmentRequest = CreateFixedFeeAmountAmendmentRequestItem[];

export class CreateFixedFeeAmountAmendmentRequestItem {
  @ValidatedPartyIdentifierApiProperty({
    description: '',
  })
  readonly partyIdentifier: AcbsPartyId;

  @ValidatedStringApiProperty({
    description: 'Segment identifier from income exposure table. 2 alphanumeric characters.',
    length: 2,
  })
  readonly period: string;

  @ValidatedStringApiProperty({
    description: 'Defines the code for the role of the party in the Facility for which the fee is created.',
    enum: LenderTypeCodeEnum,
    example: ENUMS.LENDER_TYPE_CODES.ECGD,
  })
  readonly lenderTypeCode: string;

  @ValidatedDateOnlyApiProperty({
    description: 'The effective date of this accruing/fixed fee schedule.',
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedNumberApiProperty({
    description: 'Fee amount amendment. For example: if current Fee amount is 352.10 GBP and you want to set Fee to 0, then set amount to -352.10',
    example: -352.1,
    forbidZero: true,
  })
  readonly amountAmendment: number;

  constructor(partyIdentifier: AcbsPartyId, period: string, lenderTypeCode: string, effectiveDate: DateOnlyString, amountAmendment: number) {
    this.partyIdentifier = partyIdentifier;
    this.period = period;
    this.lenderTypeCode = lenderTypeCode;
    this.effectiveDate = effectiveDate;
    this.amountAmendment = amountAmendment;
  }
}
