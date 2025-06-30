import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type UpdateDealRequest = UpdateDealRequestItem[];

export class UpdateDealRequestItem {
  @ValidatedNumberApiProperty({
    description: 'The value of the deal.',
    minimum: 0,
  })
  dealValue: number;

  @ValidatedCurrencyApiProperty({
    description: 'The currency code of the primary currency of the deal, from the Currency Definition Table.',
  })
  currency?: string;

  @ValidatedStringApiProperty({
    description: 'The obligor party identifier.',
    minLength: 8,
    maxLength: 8,
    example: '00000001',
  })
  obligorPartyIdentifier?: string;

  @ValidatedStringApiProperty({
    description: 'The obligor party industry classification.',
    minLength: 0,
    maxLength: 10,
    example: '1405',
  })
  obligorIndustryClassification?: string;

  constructor(currency: string, dealValue: number, obligorPartyIdentifier: string, obligorIndustryClassification: string) {
    this.currency = currency;
    this.dealValue = dealValue;
    this.obligorPartyIdentifier = obligorPartyIdentifier;
    this.obligorIndustryClassification = obligorIndustryClassification;
  }
}
