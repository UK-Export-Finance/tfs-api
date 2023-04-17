import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { Matches } from 'class-validator';

export class GetFacilityInvestorsParamsDto {
  @ApiProperty({ description: 'UKEF id for facility', example: EXAMPLES.FACILITY_ID })
  @Matches(/00\d{8}/)
  facilityIdentifier: UkefId;
}
