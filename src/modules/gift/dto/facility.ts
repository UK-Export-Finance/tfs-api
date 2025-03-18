import { ApiResponseProperty } from '@nestjs/swagger';

export class GiftFacilityDto {
  @ApiResponseProperty()
  facilityId: string;

  @ApiResponseProperty()
  streamId: string;

  @ApiResponseProperty()
  streamVersion: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  obligorUrn: string;

  @ApiResponseProperty()
  currency: string;

  @ApiResponseProperty()
  facilityAmount: number;

  @ApiResponseProperty()
  drawnAmount: number;

  @ApiResponseProperty()
  availableAmount: number;

  @ApiResponseProperty()
  effectiveDate: string;

  @ApiResponseProperty()
  expiryDate: string;

  @ApiResponseProperty()
  endOfCoverDate: string;

  @ApiResponseProperty()
  dealId: string;

  @ApiResponseProperty()
  isRevolving: boolean;

  @ApiResponseProperty()
  isDraft: boolean;

  @ApiResponseProperty()
  createdDatetime: string;
}
