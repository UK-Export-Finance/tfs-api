import { ENUMS, EXAMPLES, PROPERTIES, UKEFID } from '@ukef/constants';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type CreatePartyRequestDto = CreatePartyRequestItem[];

export class CreatePartyRequestItem {
  @ValidatedStringApiProperty({
    description: 'The UKEF ID for the party.',
    length: 8,
    pattern: UKEFID.PARTY_ID.REGEX,
    example: EXAMPLES.PARTY_ALTERNATE_ID,
  })
  alternateIdentifier: string;

  @ValidatedStringApiProperty({
    description: 'The primary industry classification code for this customer.',
    minLength: 1,
    maxLength: 10,
    example: EXAMPLES.INDUSTRY_CLASSIFICATION,
  })
  industryClassification: string;

  @ValidatedStringApiProperty({
    description: 'The primary customer name.',
    minLength: 1,
    maxLength: 35,
    example: EXAMPLES.PARTY_NAME,
  })
  name1: string;

  @ValidatedStringApiProperty({
    description: 'The secondary customer name.',
    required: false,
    maxLength: 35,
    example: EXAMPLES.PARTY_NAME,
  })
  name2?: string;

  @ValidatedStringApiProperty({
    description: 'The tertiary customer name.',
    required: false,
    maxLength: 35,
    example: EXAMPLES.PARTY_NAME,
  })
  name3?: string;

  @ValidatedStringApiProperty({
    description: 'A code that indicates what minority class this customer represents.',
    minLength: 1,
    maxLength: 2,
    example: EXAMPLES.SME_TYPE,
  })
  smeType: string;

  @ValidatedStringApiProperty({
    description: `A code that identifies the citizenship category of this customer. Should be '1' if the domicile country is the UK, otherwise '2'.`,
    length: 1,
    enum: ENUMS.CITIZENSHIP_CLASSES,
    example: EXAMPLES.CITIZENSHIP_CLASS,
  })
  citizenshipClass: string;

  @ValidatedDateOnlyApiProperty({
    description: 'The date of creation.',
  })
  officerRiskDate: string;

  @ValidatedStringApiProperty({
    description: "The country code for the party's primary address.",
    required: false,
    maxLength: 3,
    default: PROPERTIES.PARTY.DEFAULT.address.countryCode,
    example: EXAMPLES.COUNTRY_CODE,
  })
  countryCode?: string;
}
