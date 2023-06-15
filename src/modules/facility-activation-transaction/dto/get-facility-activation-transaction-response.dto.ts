import { ApiProperty } from '@nestjs/swagger';
import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString } from '@ukef/helpers';

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
    enum: ENUMS.BUNDLE_STATUS_CODES,
    example: EXAMPLES.BUNDLE_STATUS_CODE,
  })
  readonly bundleStatusCode: string;

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
  })
  readonly lenderTypeCode: string;

  @ApiProperty({
    description: 'In most situations the value should be 3, it means auto approval.',
    example: ENUMS.INITIAL_BUNDLE_STATUS_CODES.SUBMIT_FOR_POSTING,
    enum: ENUMS.INITIAL_BUNDLE_STATUS_CODES,
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
  readonly accountOwnerIdentifier: AcbsPartyId;

  @ApiProperty({
    description: 'The effective date of the facility.',
    type: Date,
    format: 'date',
    required: false,
  })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: `'A' for 'Active' to activate facility or 'C' to cancel.`,
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
  readonly facilityTransactionTypeCode: number;

  @ApiProperty({
    description: 'If this value is true, it sets the bundle to draft.',
    required: false,
  })
  readonly isDraftIndicator: boolean;

  @ApiProperty({
    description: 'The party identifier of the obligor.',
    minLength: 0,
    maxLength: 8,
    example: EXAMPLES.PARTY_ID,
    required: false,
  })
  readonly limitKeyValue: AcbsPartyId;

  @ApiProperty({
    description: `A numeric code denoting the type of limit established for the involved fee. '00' is 'overall limit'.`,
    minLength: 0,
    maxLength: 2,
    enum: ENUMS.LIMIT_TYPE_CODES,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.limitType.limitTypeCode,
    required: false,
  })
  readonly limitTypeCode: string;

  @ApiProperty({
    description: `The section identifier to which the limit is associated. For example, if the limit is created under the overall facility, this value is '00'; if created under a section, this is the ID of that section.`,
    minLength: 0,
    maxLength: 2,
    example: PROPERTIES.FACILITY_ACTIVATION_TRANSACTION.DEFAULT.bundleMessageList.sectionIdentifier,
    required: false,
  })
  readonly sectionIdentifier: string;
}
