import { ApiProperty } from '@nestjs/swagger';
import { UkefId } from '@ukef/helpers';
import { Matches } from 'class-validator';

export class GetDealsInvestorsParamsDto {
  @ApiProperty({ description: 'UKEF id for deal', example: '0030000321' })
  @Matches(/00\d{8}/)
  dealIdentifier: UkefId;
}
