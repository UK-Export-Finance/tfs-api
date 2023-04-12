import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateString, UkefId } from '@ukef/helpers';

export type CreateDealInvestorRequest = CreateDealInvestorRequestItem[];

export class CreateDealInvestorRequestItem {
  @ValidatedStringApiProperty({
    description: "'The identifier of the deal to create the investor for. It will be a 10-digit code beginning with either '0020', '0030', or '0040'.",
    example: '0020900111',
    length: 10,
    pattern: /00\d{8}/,
  })
  readonly dealIdentifier: UkefId;

  @ValidatedStringApiProperty({
    description: 'The lender type code for the investor party of the deal.',
    example: '500',
    minLength: 0,
    maxLength: 3,
    required: false,
    default: '500',
  })
  readonly lenderType?: string;

  @ValidatedDateOnlyApiProperty({
    description: "The effective date on the deal investor record. If the date provided is in the future, it will be replaced by today's date.",
    example: '2023-03-24',
  })
  readonly effectiveDate: DateString;

  @ValidatedDateOnlyApiProperty({
    description: 'The expiry date on the deal investor record. If the value is not provided or is null then the maximum expiry date will be set.',
    example: '2023-03-24',
    required: false,
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

  @ValidatedStringApiProperty({
    description: 'The deal currency code.',
    example: 'USD',
    length: 3,
  })
  readonly currency: string;
}
