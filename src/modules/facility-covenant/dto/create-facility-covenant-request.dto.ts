import { ENUMS, UKEFID } from '@ukef/constants';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export type CreateFacilityCovenantRequestDto = CreateFacilityCovenantRequestItem[];

export class CreateFacilityCovenantRequestItem {
  @ValidatedStringApiProperty({
    description: 'The identifier of the covenant in ACBS. When creating a covenant an identifier from the number generator should be used.',
    example: '0000000001',
    length: 10,
    pattern: UKEFID.COVENANT_ID.REGEX,
  })
  readonly covenantIdentifier: string;

  @ValidatedStringApiProperty({
    description:
      'The covenant type code: 43 for a UK Contract Value covenant, 46 for a Chargeable Amount covenant, and 47 for a Chargeable Amount covenant not in GBP.',
    length: 2,
    example: '43',
    enum: ENUMS.COVENANT_TYPE_CODES,
  })
  readonly covenantType: string;

  @ValidatedNumberApiProperty({
    description: 'The amount used to determine if the covenant is in compliance or not. It is called target amount in ACBS.',
    minimum: 0,
  })
  readonly maximumLiability: number;

  @ValidatedStringApiProperty({
    description: 'The covenant currency type code. The maximum number of characters allowed is 1. It is called pledge type code in ACBS.',
    example: 'N',
    minLength: 0,
    maxLength: 1,
  })
  readonly currency: string;

  @ValidatedDateOnlyApiProperty({
    description: 'The expiration date of the covenant. It is called expiration date in ACBS.',
    example: '2023-04-19',
  })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The effective date of the covenant.',
    example: '2023-04-19',
  })
  readonly effectiveDate: DateOnlyString;
}
