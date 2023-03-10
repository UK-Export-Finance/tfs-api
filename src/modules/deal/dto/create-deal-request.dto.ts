import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type CreateDealRequest = CreateDealRequestItem[];

export class CreateDealRequestItem {
  @ValidatedStringApiProperty({
    description: 'The identifier of the deal to create.',
    example: '0020900035',
    minLength: 10,
    maxLength: 10,
  })
  dealIdentifier: string;

  @ValidatedStringApiProperty({
    description: 'The currency code of the primary currency of the deal, from the Currency Definition Table.',
    example: 'GBP',
    minLength: 3,
    maxLength: 3,
  })
  currency: string;

  @ValidatedNumberApiProperty({
    description: 'The value of the deal.',
    minimum: 0,
  })
  dealValue: number;

  @ValidatedDateOnlyApiProperty({
    description:
      'Deal effective date is not in workflow. Currently operations assume a date earlier than the Facility effective date. Use the earliest Effective Date on facilities in Workflow under this Deal, i.e. Guarantee Commencement Date.',
  })
  guaranteeCommencementDate: DateOnlyString;

  @ValidatedStringApiProperty({
    description: 'The obligor party identifier.',
    minLength: 8,
    maxLength: 8,
    example: '00000001',
  })
  obligorPartyIdentifier: string;

  @ValidatedStringApiProperty({
    description: 'The obligor party name, which is party name1 attribute.',
    minLength: 0,
    maxLength: 35,
  })
  obligorName: string;

  @ValidatedStringApiProperty({
    description: 'The obligor party industry classification.',
    minLength: 0,
    maxLength: 10,
    example: '1405',
  })
  obligorIndustryClassification: string;

  constructor(
    dealIdentifier: string,
    currency: string,
    dealValue: number,
    guaranteeCommencementDate: DateOnlyString,
    obligorPartyIdentifier: string,
    obligorName: string,
    obligorIndustryClassification: string,
  ) {
    this.dealIdentifier = dealIdentifier;
    this.currency = currency;
    this.dealValue = dealValue;
    this.guaranteeCommencementDate = guaranteeCommencementDate;
    this.obligorPartyIdentifier = obligorPartyIdentifier;
    this.obligorName = obligorName;
    this.obligorIndustryClassification = obligorIndustryClassification;
  }
}
