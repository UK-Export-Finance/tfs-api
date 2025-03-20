import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

export class GiftFacilityDto {
  @ApiResponseProperty({
    example: FACILITY.FACILITY_ID,
  })
  facilityId: string;

  @ApiResponseProperty({
    example: FACILITY.STREAM_ID,
  })
  streamId: string;

  @ApiResponseProperty({
    example: FACILITY.STREAM_VERSION,
  })
  streamVersion: number;

  @ApiResponseProperty({
    example: FACILITY.FACILITY_NAME,
  })
  name: string;

  @ApiResponseProperty({
    example: FACILITY.OBLIGOR_URN,
  })
  obligorUrn: string;

  @ApiResponseProperty({
    example: FACILITY.CURRENCY,
  })
  currency: string;

  @ApiResponseProperty({
    example: FACILITY.FACILITY_AMOUNT,
  })
  facilityAmount: number;

  @ApiResponseProperty({
    example: FACILITY.DRAWN_AMOUNT,
  })
  drawnAmount: number;

  @ApiResponseProperty({
    example: FACILITY.AVAILABLE_AMOUNT,
  })
  availableAmount: number;

  @ApiResponseProperty({
    example: FACILITY.EFFECTIVE_DATE,
  })
  effectiveDate: string;

  @ApiResponseProperty({
    example: FACILITY.EXPIRY_DATE,
  })
  expiryDate: string;

  @ApiResponseProperty({
    example: FACILITY.END_OF_COVER_DATE,
  })
  endOfCoverDate: string;

  @ApiResponseProperty({
    example: FACILITY.DEAL_ID,
  })
  dealId: string;

  @ApiResponseProperty({
    example: FACILITY.IS_REVOLVING,
  })
  isRevolving: boolean;

  @ApiResponseProperty({
    example: FACILITY.IS_DRAFT,
  })
  isDraft: boolean;

  @ApiResponseProperty({
    example: FACILITY.CREATED_DATE_TIME,
  })
  createdDatetime: string;
}
