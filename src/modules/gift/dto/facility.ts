import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { IsBoolean, IsNumber, IsNumberString, IsString } from 'class-validator';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

export class GiftFacilityDto {
  @IsString()
  @ApiProperty({
    example: FACILITY.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
  })
  facilityId: UkefId;

  // TODO(?) this is NOT required for creation
  // @IsString()
  @ApiProperty({
    example: FACILITY.STREAM_ID,
  })
  streamId: string;

  // TODO(?) this is NOT required for creation
  // @IsNumber()
  @ApiProperty({
    example: FACILITY.STREAM_VERSION,
  })
  streamVersion: number;

  @IsString()
  @ApiProperty({
    example: FACILITY.FACILITY_NAME,
  })
  name: string;

  @IsNumberString()
  @ApiProperty({
    example: FACILITY.OBLIGOR_URN,
  })
  obligorUrn: string;

  @IsString()
  @ApiProperty({
    example: FACILITY.CURRENCY,
  })
  currency: string;

  @IsNumber()
  @ApiProperty({
    example: FACILITY.FACILITY_AMOUNT,
  })
  facilityAmount: number;

  // @IsNumber()
  // @ApiProperty({
  //   example: FACILITY.DRAWN_AMOUNT,
  // })
  // drawnAmount: number;

  // @IsNumber()
  // @ApiProperty({
  //   example: FACILITY.AVAILABLE_AMOUNT,
  // })
  // availableAmount: number;

  @IsString()
  @ApiProperty({
    example: FACILITY.EFFECTIVE_DATE,
  })
  effectiveDate: string;

  @IsString()
  @ApiProperty({
    example: FACILITY.EXPIRY_DATE,
  })
  expiryDate: string;

  @IsString()
  @ApiProperty({
    example: FACILITY.END_OF_COVER_DATE,
  })
  endOfCoverDate: string;

  // TODO:
  // @ValidateIf((o) => o.dealId isNotNullOrUndefined) ... 
  // or maybe https://stackoverflow.com/a/76738269

  // TODO: SHOULD dealId be required? optional in the UI.
  @IsString()
  @ApiProperty({
    example: FACILITY.DEAL_ID,
  })
  dealId: UkefId;

  @IsBoolean()
  @ApiProperty({
    example: FACILITY.IS_REVOLVING,
  })
  isRevolving: boolean;

  // TODO(?) is this required for creation
  // @IsBoolean()
  @ApiProperty({
    example: FACILITY.IS_DRAFT,
  })
  isDraft: boolean;

  // TODO(?) is this required for creation
  // @IsString()
  @ApiProperty({
    example: FACILITY.CREATED_DATE_TIME,
  })
  createdDatetime: string;



  // TODO
  // TODO
  // productType validation - handle / hard coded in APIM for MVP?
  @IsString()
  @ApiProperty({
    example: 'Export Insurance Policy (EXIP)',
  })
  productType: string;

  // TODO
  // TODO
  // facility creation - missing from GIFT swagger docs (?)
  // drawnAmount
  // availableAmount
  // isDraft
}
