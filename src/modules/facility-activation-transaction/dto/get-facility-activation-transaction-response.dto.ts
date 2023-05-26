import { ApiProperty } from '@nestjs/swagger';
import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';

export class GetFacilityActivationTransactionResponseDto {
  @ApiProperty({
    description: 'The identifier of the portfolio in ACBS. The UKEF portfolio is E1.',
    minLength: 0,
    maxLength: 2,
    example: PROPERTIES.GLOBAL.portfolioIdentifier,
  })
  readonly portfolioIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the facility in ACBS.',
    minLength: 10,
    maxLength: 10,
    example: EXAMPLES.FACILITY_ID,
  })
  readonly facilityIdentifier: string;

  @ApiProperty({
    description: 'A numeric code denoting the status of the bundle.',
    minLength: 0,
    maxLength: 2,
    example: EXAMPLES.BUNDLE_STATUS_CODE,
  })
  readonly bundleStatusCode: string; // TODO APIM-125: should this use ENUMS.BUNDLE_STATUSES?

  @ApiProperty({
    description: 'A description of the status of the bundle corresponding to the bundle status code.',
    minLength: 0,
    maxLength: 20,
    example: EXAMPLES.BUNDLE_STATUS_DESC,
  })
  readonly bundleStatusDesc: string;

  @ApiProperty({
    description: 'In most situations the value should be 100, it means first level obligor.',
    example: ENUMS.LENDER_TYPE_CODES.FIRST_LEVEL_OBLIGOR,
    minLength: 3,
    maxLength: 3,
    enum: ENUMS.LENDER_TYPE_CODES,
  })
  readonly lenderTypeCode: string;

  @ApiProperty({
    description: 'In most situations the value should be 3, it means auto approval.',
    example: ENUMS.BUNDLE_STATUSES.SUBMIT_FOR_POSTING,
    enum: ENUMS.BUNDLE_STATUSES,
  })
  readonly initialBundleStatusCode: number;

  @ApiProperty({
    description: `A value used to populate the Bundle Properties 'Initiated By' field.`,
    minLength: 0,
    maxLength: 60,
    example: EXAMPLES.INITIATING_USERNAME,
    required: false,
  })
  readonly initiatingUserName: string;

  @ApiProperty({
    description: `The identifier of the account owner in ACBS.`,
    minLength: 8,
    maxLength: 8,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.accountOwnerIdentifier,
    required: false,
  })
  readonly accountOwnerIdentifier: string; // TODO APIM-125: Does this have to be length 8?

  @ApiProperty({
    description: '', // TODO APIM-125: description? (nothing in Mulesoft or ACBS docs)
    type: Date,
    format: 'date',
    required: false,
  })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: '', // TODO APIM-125: description? (nothing in Mulesoft or ACBS docs)
    minLength: 0,
    maxLength: 10,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.facilityTransactionCodeValue.facilityTransactionCodeValueCode,
    required: false,
  })
  readonly facilityTransactionCodeValueCode: string;

  @ApiProperty({
    description: 'A numeric code denoting the credit arrangement payment transaction type.',
    minimum: 0,
    maximum: 9999,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.facilityTransactionCodeValue.facilityTransactionCodeValueCode,
    required: false,
  })
  readonly facilityTransactionTypeCode: number; // TODO APIM-125: should this be a number or a string?

  @ApiProperty({
    description: 'If this value is true, it sets the bundle to draft.',
    required: false,
  })
  readonly isDraftIndicator: boolean;

  @ApiProperty({
    description: '', // TODO APIM-125: description? (nothing in Mulesoft or ACBS docs)
    minLength: 0,
    maxLength: 8,
    example: EXAMPLES.PARTY_ID,
    required: false,
  })
  readonly limitKeyValue: string;

  @ApiProperty({
    description: '', // TODO APIM-125: description? (nothing in Mulesoft or ACBS docs)
    minLength: 0,
    maxLength: 2,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.limitType.limitTypeCode,
    required: false,
  })
  readonly limitTypeCode: string;

  @ApiProperty({
    description: '', // TODO APIM-125: description? (nothing in Mulesoft or ACBS docs)
    minLength: 0,
    maxLength: 2,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.sectionIdentifier,
    required: false,
  })
  readonly sectionIdentifier: string;
}
