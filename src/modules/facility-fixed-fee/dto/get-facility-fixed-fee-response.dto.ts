import { ApiProperty } from '@nestjs/swagger';
import { ENUMS, EXAMPLES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { DateOnlyString } from '@ukef/helpers';

export type GetFacilityFixedFeeResponse = GetFacilityFixedFeeResponseItem[];
export class GetFacilityFixedFeeResponseItem {
  @ApiProperty({
    description: 'The identifier of the facility.',
    example: EXAMPLES.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
  })
  readonly facilityIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the portfolio.',
    example: ENUMS.PORTFOLIO.E1,
  })
  readonly portfolioIdentifier: string;

  @ApiProperty({
    description: 'The fixed amount to be billed to the client. If a flat amount is charged, this field is required.',
    example: EXAMPLES.DEAL_OR_FACILITY_VALUE,
    minimum: 0,
    maximum: 1e17,
  })
  readonly amount: number;

  @ApiProperty({
    description: 'The effective date of this accruing/Fixed fee schedule.',
    type: Date,
    format: 'date',
    example: '2023-03-24',
  })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: 'The expiration date of this accruing/Fixed fee schedule.',
    type: Date,
    format: 'date',
    example: '2023-03-24',
  })
  readonly expirationDate: DateOnlyString;

  @ApiProperty({
    description: 'Date the next fee bill is due for this fee schedule.',
    type: Date,
    format: 'date',
    example: '2023-03-24',
  })
  readonly nextDueDate: DateOnlyString;

  @ApiProperty({
    description: 'End date for the current accrual period. This date can be different than the Next Due Date.',
    type: Date,
    format: 'date',
    example: '2023-03-24',
  })
  readonly nextAccrueToDate: DateOnlyString;

  @ApiProperty({
    description: 'Segment identifier from income exposure table. 2 alphanumeric characters.',
    maxLength: 2,
    minLength: 2,
  })
  readonly period: string;

  @ApiProperty({
    description: 'Description of accruing/Fixed fee which is be entered by user.',
    minLength: 0,
    maxLength: 35,
  })
  readonly description: string;

  @ApiProperty({
    description:
      'The currency of Facility Fee, defined in the Currency Definition Table under Systems Administration of Servicing. For example, USD for United States Dollar.',
    example: EXAMPLES.CURRENCY,
    minLength: 0,
    maxLength: 3,
  })
  readonly currency: string;

  @ApiProperty({
    description: 'Defines the code for the role of the party in the Facility for which the fee is created.',
    enum: LenderTypeCodeEnum,
    example: ENUMS.LENDER_TYPE_CODES.ECGD,
    minLength: 0,
    maxLength: 3,
  })
  readonly lenderTypeCode: string;

  @ApiProperty({
    description: 'Defines the code for the fee type of this schedule for reporting and GL purposes.',
    example: ENUMS.INCOME_CLASS_CODES.BPM,
    minLength: 0,
    maxLength: 3,
  })
  readonly incomeClassCode: string;

  @ApiProperty({
    description:
      'Action indicator to be supplied together with the Fee to control propagation of the fee effects to other investors. Not applicable to output data.',
  })
  readonly spreadToInvestorsIndicator: boolean;
}
