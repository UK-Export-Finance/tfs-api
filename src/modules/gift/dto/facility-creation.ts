import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { IsDefined, IsBoolean, IsNotEmptyObject, IsObject, Validate, ValidateNested } from 'class-validator';

import { GiftFacilityDto } from './facility';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

// TODO: DRY test mocks
// TODO: this is facility get/creation RESPONSE.
// e.g, streamId is not relevant for creation.
const mockGiftFacility: GiftFacilityDto = {
  facilityId: FACILITY.FACILITY_ID,
  streamId: FACILITY.STREAM_ID,
  streamVersion: FACILITY.STREAM_VERSION,
  name: FACILITY.FACILITY_NAME,
  obligorUrn: FACILITY.OBLIGOR_URN,
  currency: FACILITY.CURRENCY,
  facilityAmount: FACILITY.FACILITY_AMOUNT,
  // drawnAmount: FACILITY.DRAWN_AMOUNT,
  // availableAmount: FACILITY.AVAILABLE_AMOUNT,
  effectiveDate: FACILITY.EFFECTIVE_DATE,
  expiryDate: FACILITY.EXPIRY_DATE,
  endOfCoverDate: FACILITY.END_OF_COVER_DATE,
  dealId: FACILITY.DEAL_ID,
  isRevolving: FACILITY.IS_REVOLVING,
  isDraft: FACILITY.IS_DRAFT,
  createdDatetime: FACILITY.CREATED_DATE_TIME,
  productType: 'MOCK',
};

// TODO: should facilityID be outside of overview?
export class GiftFacilityCreationDto {
  @ApiProperty({
    example: mockGiftFacility,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityDto)
  @ValidateNested()
  overview: GiftFacilityDto;
}
