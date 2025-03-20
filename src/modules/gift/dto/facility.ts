import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

export class GiftFacilityDto {
  @ApiProperty({
    example: FACILITY.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
  })
  facilityId: string;

  @ApiProperty({
    example: FACILITY.STREAM_ID,
  })
  streamId: string;

  @ApiProperty({
    example: FACILITY.STREAM_VERSION,
  })
  streamVersion: number;

  @ApiProperty({
    example: FACILITY.FACILITY_NAME,
  })
  name: string;

  @ApiProperty({
    example: FACILITY.OBLIGOR_URN,
  })
  obligorUrn: string;

  @ApiProperty({
    example: FACILITY.CURRENCY,
  })
  currency: string;

  @ApiProperty({
    example: FACILITY.FACILITY_AMOUNT,
  })
  facilityAmount: number;

  @ApiProperty({
    example: FACILITY.DRAWN_AMOUNT,
  })
  drawnAmount: number;

  @ApiProperty({
    example: FACILITY.AVAILABLE_AMOUNT,
  })
  availableAmount: number;

  @ApiProperty({
    example: FACILITY.EFFECTIVE_DATE,
  })
  effectiveDate: string;

  @ApiProperty({
    example: FACILITY.EXPIRY_DATE,
  })
  expiryDate: string;

  @ApiProperty({
    example: FACILITY.END_OF_COVER_DATE,
  })
  endOfCoverDate: string;

  @ApiProperty({
    example: FACILITY.DEAL_ID,
  })
  dealId: string;

  @ApiProperty({
    example: FACILITY.IS_REVOLVING,
  })
  isRevolving: boolean;

  @ApiProperty({
    example: FACILITY.IS_DRAFT,
  })
  isDraft: boolean;

  @ApiProperty({
    example: FACILITY.CREATED_DATE_TIME,
  })
  createdDatetime: string;
}
