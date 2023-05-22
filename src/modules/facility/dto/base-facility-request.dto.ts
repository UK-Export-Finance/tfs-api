import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property.decorator';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedPartyIdentifierApiProperty } from '@ukef/decorators/validated-party-identifier-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export class BaseFacilityRequestItem {
  @ValidatedDealIdentifierApiProperty({
    description: 'The identifier of the deal for the facility.',
  })
  readonly dealIdentifier: string;

  @ValidatedPartyIdentifierApiProperty({
    description:
      'Look up the Obligors ACBS Customer record using Party URN on the Deal = Alternate Customer Id (J$MSZI). Use ACBS Customer Id (J$MRUI) Note there may be multiple customers in ACBS with the same Party URN. Use the first record found.',
  })
  readonly dealBorrowerIdentifier: string;

  @ValidatedStringApiProperty({
    description: `The facility type, e.g. '250' for BOND.`,
    example: '250',
    maxLength: 3,
  })
  readonly productTypeId: string;

  @ValidatedStringApiProperty({
    description: 'The name or description of the facility type.',
    example: 'BOND',
    maxLength: 13,
  })
  readonly productTypeName: string;

  @ValidatedStringApiProperty({
    description: 'Credit Period',
    example: '1',
    maxLength: 12,
  })
  readonly exposurePeriod: string;

  @ValidatedCurrencyApiProperty({
    description: 'Facility Currency Code e.g. CAD, USD.',
  })
  readonly currency: string;

  @ValidatedStringApiProperty({
    description: 'The industry classification code of the obligor.',
    example: '0116',
    maxLength: 10,
  })
  readonly obligorIndustryClassification: string;

  @ValidatedDateOnlyApiProperty({
    description: `The date from which the borrower can draw funds from the facility. If this is a future date then it will be replaced with today's date.`,
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The expiration date of the facility.',
  })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The end date of the next quarter.',
  })
  readonly nextQuarterEndDate: DateOnlyString;

  @ValidatedNumberApiProperty({
    description: 'The overall limit for the facility.',
    minimum: 0,
  })
  readonly maximumLiability: number;

  @ValidatedStringApiProperty({
    description: 'The party identifier of the Agent Bank for this facility.',
    example: '00000000',
    maxLength: 10,
  })
  readonly agentBankIdentifier: string;

  @ValidatedStringApiProperty({
    description: 'The code of the primary country of risk designated for this credit arrangement.',
    example: EXAMPLES.COUNTRY_CODE,
    maxLength: 3,
  })
  readonly riskCountryCode: string;

  @ValidatedStringApiProperty({
    description: 'Pre-Issue Est. Payment Frequency QUARTERLY(2)',
    example: '2',
    maxLength: 1,
  })
  readonly premiumFrequencyCode: string;

  @ValidatedStringApiProperty({
    description: 'CORPORATE(03)',
    example: '03',
    maxLength: 2,
  })
  readonly riskStatusCode: string;

  @ValidatedStringApiProperty({
    description: 'Credit Review Risk Code',
    example: '13',
    maxLength: 2,
  })
  readonly creditRatingCode: string;

  @ValidatedStringApiProperty({
    description: 'Case Stage this can be 06 Commitment and 07 Issued',
    example: '07',
    maxLength: 2,
  })
  readonly facilityStageCode: string;

  @ValidatedStringApiProperty({
    description: 'Derive values A, M or N',
    example: 'A',
    maxLength: 4,
  })
  readonly delegationType: string;

  @ValidatedNumberApiProperty({
    description: 'Bank Rate, this can be for Bond facility corresponding fee rate or for Loan/EWCS interest rate.',
    minimum: 0,
  })
  readonly interestOrFeeRate: number;

  @ValidatedPartyIdentifierApiProperty({
    description: 'The party identifier of the obligor.',
  })
  readonly obligorPartyIdentifier: string;

  @ValidatedNumberApiProperty({
    description: 'Forecast % Derive from FACILITY:Stage, i.e. Commitment or Issued',
    minimum: 0,
  })
  readonly forecastPercentage: number;

  @ValidatedNumberApiProperty({
    description: 'A percentage indicating how likely it is that a default on the credit will occur. This should be specified for GEF.',
    minimum: 0,
    required: false,
    default: PROPERTIES.FACILITY.DEFAULT.POST.probabilityofDefault,
  })
  readonly probabilityOfDefault?: number;

  @ValidatedStringApiProperty({
    description:
      'The code of the Capital Conversion Factor for the facility (e.g. 100% Conversion, 80% Conversion, No Conversion) from the T1125 table in ACBS. This field should be specified for GEF. When this field is not specified, a default will be chosen based on the productTypeId.',
    example: '1',
    required: false,
    maxLength: 2,
  })
  readonly capitalConversionFactorCode?: string;

  @ValidatedDateOnlyApiProperty({
    description: 'Issue Date for Bond or Disbursement Date for Loan/EWCS. Not required at commitment stage',
    required: false,
    nullable: true,
    default: null,
  })
  readonly issueDate?: DateOnlyString | null;
}

export class BaseFacilityRequestItemWithFacilityIdentifier extends BaseFacilityRequestItem {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the facility.',
  })
  readonly facilityIdentifier: string;
}
